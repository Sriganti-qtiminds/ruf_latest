const DatabaseService = require("../../utils/service");
const db = require("../../config/db");
require("dotenv").config();
const BaseController = require("../../utils/baseClass");
const S3Service = require("../../utils/s3");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const redis = require("../../config/redis");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/pagination");
const TransactionController = require("../../utils/transaction");
const config = require("../../jsonfiles/studio_info.json");
const { generateRequestBody } = require("../../utils/requestFactory");
const CurdController = require("../curdController");
class StudioProjectController extends BaseController {
  async addNewStudioProject(req, res) {
    let connection;
    try {
      let projectData;
      if (typeof req.body.projectData === "string") {
        projectData = JSON.parse(req.body.projectData);
      } else {
        projectData = req.body.projectData;
      }
      if (!Array.isArray(projectData) || projectData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid 'projectData' array.",
        });
      }
      const fieldValues = Object.fromEntries(
        projectData.map(({ key, value }) => [key, value])
      );
      fieldValues.project_name = "placeholder";
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);
      const curd = new CurdController.UniversalProcedure();
      curd.dbService.connection = connection;
      req.body = generateRequestBody("studio_projects_info", {
        operationType: "insert",
        fieldValues,
      });
      const { redisKey } = req.body;
      const dbResponse = await curd.executeProcedure(req);
      const insertId = dbResponse?.result?.insertId ?? dbResponse?.insertId;
      if (!insertId)
        throw new Error("Project insert failed — insertId not found.");
      const formatDateForName = () => {
        const now = new Date();
        return `${String(now.getDate()).padStart(2, "0")}${String(
          now.getMonth() + 1
        ).padStart(2, "0")}${now.getFullYear()}`;
      };
      const generatedProjectName = `P${String(insertId).padStart(
        3,
        "0"
      )}${formatDateForName()}`;
      req.body = generateRequestBody("studio_projects_info", {
        operationType: "update",
        updatekeyvaluepairs: {
          project_name: generatedProjectName,
          current_status: 43,
        },
        whereclause: `id = ${insertId}`,
      });
      await curd.executeProcedure(req);
      const projectIdSegment = `proj${String(insertId).padStart(2, "0")}`;
      const pdfBasePath = `studio/docs/${projectIdSegment}`;
      const pdfFiles = req.files?.["pdfs"] || [];
      const uploadedFiles = { pdfs: [] };

      if (pdfFiles.length) {
        uploadedFiles.pdfs = await S3Service.uploadToS3(pdfFiles, pdfBasePath);
      }
      const pdfFolderPath = `${pdfBasePath}/`;
      req.body = generateRequestBody("studio_projects_info", {
        operationType: "update",
        updatekeyvaluepairs: {
          documents_path: JSON.stringify({
            pdfs: pdfFolderPath,
            files: uploadedFiles,
          }),
        },
        whereclause: `id = ${insertId}`,
      });
      await curd.executeProcedure(req);
      await TransactionController.commitTransaction(connection);
      if (redis && redis.del && redisKey) {
        try {
          await redis.del(redisKey);
        } catch (err) {
          console.warn("⚠️ Redis delete failed:", err.message);
        }
      }
      return res.status(201).json({
        success: true,
        message: "Studio project added successfully.",
        projectId: insertId,
        projectName: generatedProjectName,
        mediaPath: {
          documents: pdfFolderPath,
          files: uploadedFiles,
        },
      });
    } catch (error) {
      if (connection)
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to add studio project.",
          error: error.message,
        });
      }
    } finally {
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }
  async getAllStudioProjects(req, res) {
    const { id, cust_id, status } = req.query;
    const curd = new CurdController.UniversalProcedure();
    const S3_BASE_URL = process.env.S3_BASE_URL;
    try {
      const isSimpleQuery = !id && !cust_id && !status;
      const whereClauses = [];
      if (id) whereClauses.push(`sp.id = ${Number(id)}`);
      if (cust_id) whereClauses.push(`sp.cust_id = '${cust_id}'`);
      const statusMap = {
        created: 42,
        InProgress: 43,
        pending: 44,
        completed: 45,
      };
      if (status) {
        const statusKey = status.toLowerCase();
        if (statusMap[statusKey]) {
          whereClauses.push(`sp.current_status = ${statusMap[statusKey]}`);
        } else {
          return res.status(200).json({
            success: true,
            counts: {},
            result: [],
          });
        }
      } else {
        whereClauses.push(`sp.current_status IN (42, 43, 44, 45)`);
      }
      const whereClause = whereClauses.join(" AND ");
      req.body = generateRequestBody("studio_projects_info", {
        operationType: "select",
        whereclause: whereClause || undefined,
      });
      const { redisKey } = req.body;
      if (isSimpleQuery && redis && redis.get) {
        try {
          const cached = await redis.get(redisKey);
          if (cached) {
            return res.status(200).json({
              success: true,
              source: "cache",
              result: JSON.parse(cached),
            });
          }
        } catch (err) {
          console.warn("Redis GET failed:", err.message);
        }
      }
      const dbResponse = await curd.executeProcedure(req);
      const result = dbResponse?.result || [];
      const addS3Base = (path) => {
        return path && path.startsWith("http")
          ? path
          : `${S3_BASE_URL}/${path}`;
      };
      console.log("Result in Studio_projects :", result);

      result.forEach((project) => {
        if (project.documents_path) {
          try {
            const docs =
              typeof project.documents_path === "string"
                ? JSON.parse(project.documents_path)
                : project.documents_path;
            for (const key of Object.keys(docs)) {
              if (Array.isArray(docs[key])) {
                docs[key] = docs[key].map(addS3Base);
              }
            }
            project.documents_path = docs;
          } catch (err) {
            console.warn(
              `Invalid JSON in documents_path for project ${project.id}`
            );
          }
        }
      });
      if (isSimpleQuery && result.length > 0 && redis && redis.set) {
        try {
          await redis.set(redisKey, JSON.stringify(result));
        } catch (err) {
          console.warn("Redis SET failed:", err.message);
        }
      }
      const counts = {
        created: result.filter((p) => Number(p.current_status) === 42).length,
        notstarted: result.filter((p) => Number(p.current_status) === 43)
          .length,
        pending: result.filter((p) => Number(p.current_status) === 44).length,
        completed: result.filter((p) => Number(p.current_status) === 45).length,
        total: result.length,
      };
      return res.status(200).json({
        success: true,
        source: isSimpleQuery ? "db + cache" : "db",
        counts,
        result,
      });
    } catch (error) {
      console.error("Error retrieving studio projects:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve studio projects.",
        error: error.message,
      });
    }
  }
async getProjectDocuments(req, res) {
  try {
    const { project_formatted_id } = req.query;

    let query = "SELECT id, project_formatted_id, documents_path FROM studio_project";
    const params = [];

    if (project_formatted_id) {
      query += " WHERE project_formatted_id = ?";
      params.push(project_formatted_id);
    }

    const [rows] = await db.query(query, params);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const projectsWithDocs = await Promise.all(
      rows.map(async (project) => {
        let urls = [];
        if (project.documents_path) {
          urls = await S3Service.getPDFUrls(project.documents_path);
        }

        return {
          id: uuidv4(),
          project_formatted_id: project.project_formatted_id,
          documents: urls.map((url) => ({
            id: uuidv4(),
            url,
            name: url.split("/").pop().replace(/\.[^/.]+$/, ""),
          })),
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: projectsWithDocs,
    });
  } catch (err) {
    console.error("Error fetching studio projects:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: err.message,
    });
  }
}
  async updateStudioProject(req, res) {
    let connection;
    try {
      let projectData = req.body.projectData;
      if (typeof projectData === "string")
        projectData = JSON.parse(projectData);
      if (
        !projectData ||
        (Array.isArray(projectData) && projectData.length === 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid 'projectData'.",
        });
      }
      const fieldValues = Array.isArray(projectData)
        ? Object.fromEntries(projectData.map(({ key, value }) => [key, value]))
        : { ...projectData };
      const id = parseInt(fieldValues.id, 10);
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "Missing or invalid 'id'." });
      delete fieldValues.id;
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);
      const curd = new CurdController.UniversalProcedure();
      curd.dbServicestudio = {
        callUniversalProcedure:
          curd.dbServicestudio.callUniversalProcedure.bind(
            curd.dbServicestudio
          ),
        connection,
      };
      const updatedFields = {};
      if (Object.keys(fieldValues).length > 0) {
        req.body = generateRequestBody("studio_projects_info", {
          operationType: "update",
          updatekeyvaluepairs: fieldValues,
          whereclause: `id = ${id}`,
        });
        await curd.executeProcedure(req);
        Object.assign(updatedFields, fieldValues);
      }
      const projectIdSegment = `proj${String(id).padStart(2, "0")}`;
      const pdfBasePath = `studio/docs/${projectIdSegment}`;
      const pdfFiles = req.files?.pdfs || req.files || [];
      let mergedPdfs = [];
      if (pdfFiles.length) {
        const oldDocsQuery = generateRequestBody("studio_projects_info", {
          operationType: "select",
          fields: ["documents_path"],
          whereclause: `sp.id = ${id}`,
        });
        const oldDocsResult = await curd.executeProcedure({
          body: oldDocsQuery,
        });

        let oldPdfs = [];
        if (
          oldDocsResult?.result?.length &&
          oldDocsResult.result[0].documents_path
        ) {
          try {
            const parsed = JSON.parse(oldDocsResult.result[0].documents_path);
            if (Array.isArray(parsed)) {
              oldPdfs = parsed
                .map((item) => (item?.url ? { url: item.url } : null))
                .filter(Boolean);
            }
          } catch (e) {
            oldPdfs = [];
          }
        }
        const newUploaded = await S3Service.uploadToS3(pdfFiles, pdfBasePath);
        const formattedNew = newUploaded
          .map((item) => ({ url: typeof item === "string" ? item : item.url }))
          .filter(Boolean);
        mergedPdfs = [...oldPdfs, ...formattedNew];
        while (JSON.stringify(mergedPdfs).length > 1900) {
          mergedPdfs.pop();
        }
        req.body = generateRequestBody("studio_projects_info", {
          operationType: "update",
          updatekeyvaluepairs: { documents_path: JSON.stringify(mergedPdfs) },
          whereclause: `id = ${id}`,
        });
        await curd.executeProcedure(req);
      }
      await TransactionController.commitTransaction(connection);
      return res.status(200).json({
        success: true,
        message: "Studio project updated successfully.",
        id,
        updatedFields,
        uploadedFiles: mergedPdfs,
      });
    } catch (error) {
      if (connection)
        await TransactionController.rollbackTransaction(connection);
      return res.status(500).json({
        success: false,
        message: "Failed to update studio project.",
        error: error.message,
      });
    } finally {
      if (connection) await TransactionController.releaseConnection(connection);
    }
  }
  async deleteStudioProject(req, res) {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'id' to delete studio project.",
      });
    }
    const curd = new CurdController.UniversalProcedure();
    try {
      req.body = generateRequestBody("studio_projects_info", {
        operationType: "delete",
        whereclause: `id = ${Number(id)}`,
      });
      const { redisKey } = req.body;
      const dbResponse = await curd.executeProcedure(req);
      const affectedRows =
        dbResponse?.result?.affectedRows ??
        dbResponse?.affectedRows ??
        (Array.isArray(dbResponse?.result)
          ? dbResponse.result[0]?.affectedRows
          : 0);
      if (!affectedRows || affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No studio project found with the provided ID or deletion failed.",
        });
      }
      if (redis && redis.del && redisKey) {
        try {
          await redis.del(redisKey);
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "Redis delete failed (read-only replica):",
              redisErr.message
            );
          }
        }
      }
      return res.status(200).json({
        success: true,
        message: "Studio project deleted successfully.",
        result: dbResponse.result,
      });
    } catch (error) {
      console.error("Error deleting studio project:", error.message);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete studio project.",
          error: error.message,
        });
      }
    }
  }
}
module.exports = StudioProjectController;