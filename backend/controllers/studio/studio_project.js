const DatabaseService = require("../../utils/service");
const db = require("../../config/db"); 
require("dotenv").config();
const BaseController = require("../../utils/baseClass");
const S3Service = require("../../utils/s3"); 
const { S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const redis = require("../../config/redis"); 
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/pagination");
const TransactionController = require("../../utils/transaction");
const config = require("../../jsonfiles/rooms_info.json");
const { generateRequestBody } = require("../../utils/requestFactory");
const CurdController = require("../curdController");
class StudioProjectController extends BaseController{

async addNewStudioProject(req, res) {
  let connection;

  try {
    const projectData = JSON.parse(req.body.projectData);
   

    if (!Array.isArray(projectData) || projectData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'projectData' array.",
      });
    }

    const fieldValues = Object.fromEntries(
      projectData.map(({ key, value }) => [key, value])
    );

    delete fieldValues["weeks_planned"];
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
    if (!insertId) throw new Error("Project insert failed — insertId not found.");

    const formatDateForName = () => {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, "0")}_${String(
        now.getMonth() + 1
      ).padStart(2, "0")}_${now.getFullYear()}`;
    };

    const generatedProjectName = `P${String(insertId).padStart(
      3,
      "0"
    )}_${formatDateForName()}`;
   

    req.body = generateRequestBody("studio_projects_info", {
      operationType: "update",
      updatekeyvaluepairs: { project_name: generatedProjectName },
      whereclause: `id = ${insertId}`,
    });

    const updateResponse = await curd.executeProcedure(req);
   

    // === S3 Paths ===
    const uid = `prj${String(insertId).padStart(3, "0")}`;
    const taskStageSegment = `task_001_st_001`;
    const imageBasePath = `${uid}/media/Images/${taskStageSegment}`;
    const videoBasePath = `${uid}/media/videos/${taskStageSegment}`;

     const imageBasePaths = `${uid}/media/Images/${taskStageSegment}`;
    const videoBasePaths = `${uid}/media/videos/${taskStageSegment}`;

    // === Uploaded Files ===
    const beforeImages = req.files["beforeImages"] || [];
    const afterImages = req.files["afterImages"] || [];
    const beforeVideos = req.files["beforeVideos"] || [];
    const afterVideos = req.files["afterVideos"] || [];

    const uploadedFiles = {
      beforeImages: [],
      afterImages: [],
      beforeVideos: [],
      afterVideos: [],
    };

    // === Upload Files to S3 ===
    try {
      if (beforeImages.length > 0) {
        uploadedFiles.beforeImages = await S3Service.uploadImagess(beforeImages, `${imageBasePaths}/before/`);
      }

      if (afterImages.length > 0) {
        uploadedFiles.afterImages = await S3Service.uploadImagess(afterImages, `${imageBasePaths}/after/`);
      }

      if (beforeVideos.length > 0) {
        uploadedFiles.beforeVideos = await S3Service.uploadVideos(beforeVideos, `${videoBasePaths}/before/`);
      }

      if (afterVideos.length > 0) {
        uploadedFiles.afterVideos = await S3Service.uploadVideos(afterVideos, `${videoBasePaths}/after/`);
      }
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    // === Paths to Save in DB ===
    const imageFolderPaths = {
      before: `${imageBasePath}/before/`,
      after: `${imageBasePath}/after/`,
    };

    const videoFolderPaths = {
      before: `${videoBasePath}/before/`,
      after: `${videoBasePath}/after/`,
    };

   

    // === Update documents_path in DB ===
    req.body = generateRequestBody("studio_projects_info", {
      operationType: "update",
      updatekeyvaluepairs: {
        documents_path: JSON.stringify({
          images: imageFolderPaths,
          videos: videoFolderPaths,
          files: uploadedFiles,
        }),
      },
      whereclause: `id = ${insertId}`,
    });

    const docUpdate = await curd.executeProcedure(req);
    

    await TransactionController.commitTransaction(connection);
   

    // === Clear Redis Cache ===
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
        
      } catch (err) {
        console.warn("⚠️ Redis delete failed:", err.message);
      }
    }

    // === Response ===
    return res.status(201).json({
      success: true,
      message: "Studio project added successfully.",
      projectId: insertId,
      projectName: generatedProjectName,
      documentsPath: {
        images: imageFolderPaths,
        videos: videoFolderPaths,
        files: uploadedFiles,
      },
    });

  } catch (error) {
   
    if (connection) await TransactionController.rollbackTransaction(connection, error.message);

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
  const { id, cust_id } = req.query;
  const curd = new CurdController.UniversalProcedure();
  const S3_BASE_URL = process.env.S3_BASE_URL; // now from .env

  try {
    const isSimpleQuery = !id && !cust_id;
    const whereClauses = [];
    if (id) whereClauses.push(`sp.id = ${Number(id)}`);
    if (cust_id) {
      whereClauses.push(`sp.cust_id = '${cust_id}'`);
      whereClauses.push(`sp.current_status >= 35`);
    }
    const whereClause = whereClauses.join(" AND ");

    req.body = generateRequestBody("studio_projects_info", {
      operationType: "select",
      whereclause: whereClause || undefined
    });

    const { redisKey } = req.body;

    // Redis GET
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

    // Helper to prepend S3 base URL
    const addS3Base = (path) => {
      return path.startsWith("http") ? path : `${S3_BASE_URL}/${path}`;
    };

    // Transform document_path to have full URLs from env
    result.forEach(project => {
      if (project.documents_path) {
        try {
          const docs = typeof project.documents_path === "string"
            ? JSON.parse(project.documents_path)
            : project.documents_path;

          for (const key of Object.keys(docs)) {
            if (Array.isArray(docs[key])) {
              docs[key] = docs[key].map(addS3Base);
            }
          }

          project.documents_path = docs;
        } catch (err) {
          console.warn(`Invalid JSON in documents_path for project ${project.id}`);
        }
      }
    });

    // Redis SET
    if (isSimpleQuery && result.length > 0 && redis && redis.set) {
      try {
        await redis.set(redisKey, JSON.stringify(result));
      } catch (err) {
        console.warn("Redis SET failed:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      source: isSimpleQuery ? "db + cache" : "db",
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



async updateStudioProject(req, res) {
  let connection;
  try {
    const { projectData } = req.body;
    if (!Array.isArray(projectData) || projectData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'projectData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      projectData.map(({ key, value }) => [key, value])
    );
    const projectId = parseInt(fieldValues.id, 10);
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'id' for update.",
      });
    }
    delete fieldValues.id;
    if (Object.keys(fieldValues).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update fields provided.",
      });
    }
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);
    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;
    req.body = generateRequestBody("studio_projects_info", {
      operationType: "update",
      updatekeyvaluepairs: fieldValues,
      whereclause: `id = ${projectId}`,
    });
    const { redisKey } = req.body;
    const dbResponse = await curd.executeProcedure(req);
    await TransactionController.commitTransaction(connection);
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed (read-only replica):", redisErr.message);
        }
      }
    }
    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      result: dbResponse.result ?? dbResponse,
    });
  } catch (error) {
    console.error("Error updating project:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update project.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
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
      (Array.isArray(dbResponse?.result) ? dbResponse.result[0]?.affectedRows : 0);
    if (!affectedRows || affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No studio project found with the provided ID or deletion failed.",
      });
    }
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed (read-only replica):", redisErr.message);
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