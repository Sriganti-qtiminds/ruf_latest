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

/*
  Utility for getting affectRows count post deletion of record.
  @param: {object} dbResonse- dbResponse object.
  @returns : affectRows

*/

function getAffectedRows(dbResponse) {
  if (!dbResponse) return 0;

  if (Array.isArray(dbResponse.result)) {
    return dbResponse.result[0]?.affectedRows ?? 0;
  }

  if (dbResponse.result?.result && Array.isArray(dbResponse.result.result)) {
    return dbResponse.result.result[0]?.affectedRows ?? 0;
  }

  return 0;
}

class StudiosubtaskController extends BaseController {
  

async addNewStudioSubTask(req, res) {
  let connection;
  try {
    // Parse sub-task data
    const subTaskData = JSON.parse(req.body.subTaskData || "[]");
    if (!Array.isArray(subTaskData) || subTaskData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'subTaskData' array.",
      });
    }

    const fieldValues = Object.fromEntries(
      subTaskData.map(({ key, value }) => [key, value])
    );

    // Start transaction
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);

    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;

    // Insert sub-task
    req.body = generateRequestBody("studio_sub_tasks_info", {
      operationType: "insert",
      fieldValues,
    });
    const { redisKey } = req.body;
    const dbResponse = await curd.executeProcedure(req);

    const insertId =
      dbResponse?.result?.insertId ??
      dbResponse?.insertId ??
      dbResponse?.result?.[0]?.rowId;

    if (!insertId) throw new Error("Sub-task insert failed — insertId not found.");

    // Fetch main_task info
    req.body = generateRequestBody("studio_main_tasks", {
      operationType: "select",
      whereclause: `smt.id = ${fieldValues.main_task}`,
      fields: ["id", "main_task_formatted_id", "project_id"],
    });
    const mainTaskInfo = await curd.executeProcedure(req);
    if (!mainTaskInfo?.result?.length) {
      throw new Error("Main task not found for ID: " + fieldValues.main_task);
    }

    const mainTaskId = mainTaskInfo.result[0].id;
    const projectId = mainTaskInfo.result[0].project_id;
    const mainTaskFormattedId =
      mainTaskInfo.result[0].main_task_formatted_id ||
      `MT${String(mainTaskId).padStart(2, "0")}`;

    console.log(
      "MainTaskId:", mainTaskId,
      "ProjectId:", projectId,
      "MainTaskFormattedId:", mainTaskFormattedId
    );

    // Fetch project_formatted_id
    req.body = generateRequestBody("studio_projects_info", {
      operationType: "select",
      whereclause: `sp.id = ${projectId}`,
      fields: ["sp.project_formatted_id"],
    });
    const projectInfo = await curd.executeProcedure(req);
    const projectFormattedId =
      projectInfo?.result?.[0]?.project_formatted_id ||
      `${String(projectId).padStart(2, "0")}`;

    // Generate sub_task_formatted_id (NEW FORMAT)
    const sub_task_formatted_id = `P${projectId}_MT${mainTaskId}_ST${insertId}`;

    // Prepare media paths
    const imageBasePath = `studio/media/${projectFormattedId}/${mainTaskFormattedId}/${sub_task_formatted_id}/Images`;
    const videoBasePath = `studio/media/${projectFormattedId}/${mainTaskFormattedId}/${sub_task_formatted_id}/Videos`;

    const beforeImages = req.files?.beforeImages || [];
    const afterImages = req.files?.afterImages || [];
    const beforeVideos = req.files?.beforeVideos || [];
    const afterVideos = req.files?.afterVideos || [];

    const uploadedFiles = {
      beforeImages: beforeImages.length > 0 ? await S3Service.uploadImagess(beforeImages, `${imageBasePath}/before/`) : [],
      afterImages: afterImages.length > 0 ? await S3Service.uploadImagess(afterImages, `${imageBasePath}/after/`) : [],
      beforeVideos: beforeVideos.length > 0 ? await S3Service.uploadVideos(beforeVideos, `${videoBasePath}/before/`) : [],
      afterVideos: afterVideos.length > 0 ? await S3Service.uploadVideos(afterVideos, `${videoBasePath}/after/`) : [],
    };

    // MediaPath for API response only
    const mediaPath = {
      images: {
        before: { path: `${imageBasePath}/before/`},
        after: { path: `${imageBasePath}/after/` },
      },
      videos: {
        before: { path: `${videoBasePath}/before/` },
        after: { path: `${videoBasePath}/after/` },
      },
    };

    // Save only base media path in DB
    const baseMediaPath = `studio/media/${projectFormattedId}/${mainTaskFormattedId}/${sub_task_formatted_id}/`;
    req.body = generateRequestBody("studio_sub_tasks_info", {
      operationType: "update",
      updatekeyvaluepairs: {
        media_path: baseMediaPath,
        sub_task_formatted_id,
      },
      whereclause: `id = ${insertId}`,
    });
    await curd.executeProcedure(req);

    //Commit transaction
    await TransactionController.commitTransaction(connection);

    // Clear Redis cache
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        console.warn("Redis delete failed:", redisErr.message);
      }
    }

    // Return response
    return res.status(201).json({
      success: true,
      message: "Sub-task added successfully.",
      subTaskId: insertId,
      sub_task_formatted_id,
      projectId,
      mediaPath,
    });

  } catch (error) {
    console.error("Error adding sub-task:", error.message);
    if (connection) await TransactionController.rollbackTransaction(connection, error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add sub-task.",
        error: error.message,
      });
    }
  } finally {
    if (connection) await TransactionController.releaseConnection(connection);
  }
}










  async getAllStudioSubTasks(req, res) {
    const { id, project_id, main_task, cust_id } = req.query;
    const curd = new CurdController.UniversalProcedure();

    try {
      const isSimpleQuery = !id && !project_id && !main_task && !cust_id;
      const whereClauses = [];

      if (id) whereClauses.push(`sst.id = ${Number(id)}`);
      if (project_id) whereClauses.push(`sp.id = ${Number(project_id)}`);
      if (main_task) whereClauses.push(`sst.main_task = ${Number(main_task)}`);
      if (cust_id) whereClauses.push(`sp.cust_id = '${cust_id}'`);

      const whereClause = whereClauses.join(" AND ");

      req.body = generateRequestBody("studio_sub_tasks_info", {
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
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis GET failed:", redisErr.message);
          }
        }
      }

      const dbResponse = await curd.executeProcedure(req);
      let result = dbResponse?.result || [];
      result = result.map((row) => {
        try {
          return {
            ...row,
            media_path: row.media_path ? JSON.parse(row.media_path) : null,
          };
        } catch (e) {
          return {
            ...row,
            media_path: row.media_path,
          };
        }
      });

      if (isSimpleQuery && result.length > 0 && redis && redis.set) {
        try {
          await redis.set(redisKey, JSON.stringify(result));
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis SET failed:", redisErr.message);
          }
        }
      }

      return res.status(200).json({
        success: true,
        source: isSimpleQuery ? "db + cache" : "db",
        result,
      });
    } catch (error) {
      console.error("Error retrieving studio tasks:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve studio tasks.",
        error: error.message,
      });
    }
  }
 
 
async getFilteredMediaFilePaths(req, res) {
  const { project_id, task_id, sub_task_id, format, event } = req.query;
  const curd = new CurdController.UniversalProcedure();

  try {
    // Build WHERE clause for DB
    const whereClauseParts = [];
    if (project_id) whereClauseParts.push(`sp.id = '${project_id}'`);
    if (task_id) whereClauseParts.push(`sst.main_task = '${task_id}'`);
    if (sub_task_id) whereClauseParts.push(`sst.id = '${sub_task_id}'`);
    const whereClause = whereClauseParts.length ? whereClauseParts.join(" AND ") : undefined;

    // Fetch sub-tasks from DB
    req.body = generateRequestBody("studio_sub_tasks_info", {
      operationType: "select",
      configKey: "studio_sub_tasks_info",
      whereclause: whereClause,
      fields: ["sst.media_path", "sst.id", "sst.project_id", "sst.main_task"],
    });

    const dbResponse = await curd.executeProcedure(req);
    const subTasks = dbResponse?.result || [];

    if (!subTasks.length) {
      return res.status(404).json({
        success: false,
        message: "No sub-tasks found for given filters",
        data: [],
      });
    }

    // Fetch S3 URLs for each sub-task
    const mediaPathResponse = await Promise.all(
      subTasks.map(async (sub) => {
        const baseMediaPath = sub.media_path; // stored as string

        // Fetch actual media URLs from S3
        const s3MediaUrls = await S3Service.getSubTaskMediaUrls(baseMediaPath);

        // Apply filters if query params are provided
        const formats = format ? [format.toLowerCase()] : ["images", "videos"];
        const events = event ? [event.toLowerCase()] : ["before", "after"];
        const structuredMedia = {};

        for (const fmt of formats) {
          structuredMedia[fmt] = {};
          for (const evt of events) {
            structuredMedia[fmt][evt] = s3MediaUrls[fmt]?.[evt] || [];
          }
        }

        return {
          subTaskId: sub.id,
          projectId: sub.project_id,
          mainTaskId: sub.main_task,
          mediaPath: structuredMedia,
        };
      })
    );

    // Return response
    return res.status(200).json({
      success: true,
      message: "Media paths retrieved successfully",
      data: mediaPathResponse,
    });
  } catch (error) {
    console.error("Error retrieving media files:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve media file paths",
      error: error.message,
    });
  }
}


  async updateStudioSubTask(req, res) {
    let connection;

    try {
      let subTaskData = req.body.subTaskData;
      if (typeof subTaskData === "string")
        subTaskData = JSON.parse(subTaskData);

      if (
        !subTaskData ||
        (Array.isArray(subTaskData) && subTaskData.length === 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid 'subTaskData'.",
        });
      }
      const fieldValues = Array.isArray(subTaskData)
        ? Object.fromEntries(subTaskData.map(({ key, value }) => [key, value]))
        : { ...subTaskData };

      const subTaskId = parseInt(fieldValues.id, 10);
      if (!subTaskId)
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
        req.body = generateRequestBody("studio_sub_tasks_info", {
          operationType: "update",
          updatekeyvaluepairs: fieldValues,
          whereclause: `id = ${subTaskId}`,
        });
        await curd.executeProcedure(req);
        Object.assign(updatedFields, fieldValues);
      }
      req.body = generateRequestBody("studio_sub_tasks_info", {
        operationType: "select",
        fields: ["sp.id AS project_id", "sst.main_task"],
        whereclause: `sst.id = ${subTaskId}`,
        joinClause: "JOIN studio_projects_info sp ON sp.id = sst.project_id",
      });
      const dbResponse = await curd.executeProcedure(req);
      const projectId = dbResponse?.result?.[0]?.project_id || 0;
      const mainTaskId = dbResponse?.result?.[0]?.main_task || 0;
      const projectSegment = `proj${String(projectId).padStart(2, "0")}`;
      const taskSegment = `mt${String(mainTaskId).padStart(2, "0")}`;
      const subTaskSegment = `st${String(subTaskId).padStart(2, "0")}`;

      const imageBasePath = `studio/media/${projectSegment}/${taskSegment}/${subTaskSegment}/images`;
      const videoBasePath = `studio/media/${projectSegment}/${taskSegment}/${subTaskSegment}/videos`;

      const beforeImages = req.files?.beforeImages || [];
      const afterImages = req.files?.afterImages || [];
      const beforeVideos = req.files?.beforeVideos || [];
      const afterVideos = req.files?.afterVideos || [];

      let mergedMedia = {};

      if (
        beforeImages.length ||
        afterImages.length ||
        beforeVideos.length ||
        afterVideos.length
      ) {
        req.body = generateRequestBody("studio_sub_tasks_info", {
          operationType: "select",
          fields: ["media_path"],
          whereclause: `sst.id = ${subTaskId}`,
        });
        const oldMediaRes = await curd.executeProcedure(req);
        let oldMedia = {};
        try {
          oldMedia = oldMediaRes?.result?.[0]?.media_path
            ? JSON.parse(oldMediaRes.result[0].media_path)
            : {};
        } catch (e) {
          oldMedia = {};
        }
        const uploadedFiles = {
          beforeImages: beforeImages.length
            ? await S3Service.uploadImagess(
                beforeImages,
                `${imageBasePath}/before/`
              )
            : [],
          afterImages: afterImages.length
            ? await S3Service.uploadImagess(
                afterImages,
                `${imageBasePath}/after/`
              )
            : [],
          beforeVideos: beforeVideos.length
            ? await S3Service.uploadVideos(
                beforeVideos,
                `${videoBasePath}/before/`
              )
            : [],
          afterVideos: afterVideos.length
            ? await S3Service.uploadVideos(
                afterVideos,
                `${videoBasePath}/after/`
              )
            : [],
        };
        mergedMedia = {
          images: {
            before: {
              path: `${imageBasePath}/before/`,
              files: [
                ...(oldMedia?.images?.before?.files || []),
                ...uploadedFiles.beforeImages,
              ],
            },
            after: {
              path: `${imageBasePath}/after/`,
              files: [
                ...(oldMedia?.images?.after?.files || []),
                ...uploadedFiles.afterImages,
              ],
            },
          },
          videos: {
            before: {
              path: `${videoBasePath}/before/`,
              files: [
                ...(oldMedia?.videos?.before?.files || []),
                ...uploadedFiles.beforeVideos,
              ],
            },
            after: {
              path: `${videoBasePath}/after/`,
              files: [
                ...(oldMedia?.videos?.after?.files || []),
                ...uploadedFiles.afterVideos,
              ],
            },
          },
        };
        req.body = generateRequestBody("studio_sub_tasks_info", {
          operationType: "update",
          updatekeyvaluepairs: { media_path: JSON.stringify(mergedMedia) },
          whereclause: `id = ${subTaskId}`,
        });
        await curd.executeProcedure(req);
      }
      await TransactionController.commitTransaction(connection);
      return res.status(200).json({
        success: true,
        message: "Sub-task updated successfully.",
        subTaskId,
        projectId,
        updatedFields,
        mediaPath: mergedMedia,
      });
    } catch (error) {
      if (connection)
        await TransactionController.rollbackTransaction(connection);
      return res.status(500).json({
        success: false,
        message: "Failed to update sub-task.",
        error: error.message,
      });
    } finally {
      if (connection) await TransactionController.releaseConnection(connection);
    }
  }

  async deleteStudioSubTask(req, res) {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'id' to delete sub task.",
      });
    }
    const curd = new CurdController.UniversalProcedure();
    try {
      req.body = generateRequestBody("studio_sub_tasks_info", {
        operationType: "delete",
        whereclause: `id = ${Number(id)}`,
      });
      const { redisKey } = req.body;
      const dbResponse = await curd.executeProcedure(req);     
      console.log("DB Response :", dbResponse);
      const raffectedRows = getAffectedRows(dbResponse);
      console.log("Rows affected:", raffectedRows); // 1

      if (!raffectedRows || raffectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "No sub task found with the provided ID or deletion failed.",
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
        message: "Sub task deleted successfully.",
        result: dbResponse.result,
      });
    } catch (error) {
      console.error("Error deleting sub task:", error.message);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete sub task.",
          error: error.message,
        });
      }
    }
  }

  async getAllStudioSubTaskscount(req, res) {
    const { id, project_id, main_task, cust_id } = req.query;
    const redisKey = "studio_sub_tasks_records";
    const curd = new CurdController.UniversalProcedure();

    try {
      // ✅ Step 1: Try Redis cache
      const cached = await redis.get(redisKey);
      if (cached) {
        let filtered = JSON.parse(cached);

        if (id)
          filtered = filtered.filter((item) => Number(item.id) === Number(id));
        if (project_id)
          filtered = filtered.filter(
            (item) => Number(item.project_id) === Number(project_id)
          );
        if (main_task)
          filtered = filtered.filter(
            (item) => Number(item.main_task) === Number(main_task)
          );
        if (cust_id)
          filtered = filtered.filter(
            (item) => Number(item.customer_id) === Number(cust_id)
          );

        if (filtered.length > 0) {
          // ✅ Count by project_id
          const projectCounts = {};
          filtered.forEach((item) => {
            const pid = item.project_id;
            projectCounts[pid] = (projectCounts[pid] || 0) + 1;
          });

          // ✅ Count by approval_status_name
          const approvalStatusCounts = {};
          filtered.forEach((item) => {
            const status =
              item.approval_status_name?.toLowerCase() || "unknown";
            approvalStatusCounts[status] =
              (approvalStatusCounts[status] || 0) + 1;
          });

          return res.status(200).json({
            message: "Studio subtasks retrieved from cache successfully.",
            result: filtered,
            project_counts: projectCounts,
            approval_status_counts: approvalStatusCounts,
          });
        }

        console.log("⚠️ No match in cache. Falling back to DB...");
      }

      // ✅ Step 2: Build WHERE clause
      const conditions = [];
      if (id) conditions.push(`sst.id = ${Number(id)}`);
      if (project_id) conditions.push(`sst.project_id = ${Number(project_id)}`);
      if (main_task) conditions.push(`sst.main_task = ${Number(main_task)}`);
      if (cust_id) conditions.push(`sst.customer_id = ${Number(cust_id)}`);

      const whereclause = conditions.length > 0 ? conditions.join(" AND ") : "";

      // ✅ Step 3: Execute DB query
      req.body = {
        jsonfilename: "studio_info.json",
        configKey: "studio_sub_tasks_info_count",
        operationType: "select",
        whereclause,
      };

      const dbResponse = await curd.executeProcedure(req);

      if (!dbResponse?.result || dbResponse.result.length === 0) {
        return res.status(404).json({
          error: "No studio subtasks found for the given filters.",
        });
      }

      // ✅ Step 4: Map result
      const mappedResult = dbResponse.result.map((item) => ({
        id: item.id,
        project_id: item.project_id,
        main_task: item.main_task,
        sub_task_name: item.sub_task_name,
        sub_task_description: item.sub_task_description,
        vendor_id: item.vendor_id,
        approver_id: item.approver_id,
        approver_name: item.approver_name,
        percent_complete: item.percent_complete,
        approval_status: item.approval_status,
        approval_status_name: item.approval_status_name,
        media_path: item.media_path,
        start_date: item.start_date,
        end_date: item.end_date,
      }));

      // ✅ Count by project_id
      const projectCounts = {};
      mappedResult.forEach((item) => {
        const pid = item.project_id;
        projectCounts[pid] = (projectCounts[pid] || 0) + 1;
      });

      // ✅ Count by approval_status_name
      const approvalStatusCounts = {};
      mappedResult.forEach((item) => {
        const status = item.approval_status_name?.toLowerCase() || "unknown";
        approvalStatusCounts[status] = (approvalStatusCounts[status] || 0) + 1;
      });

      // ✅ Step 5: Save in Redis if no filters
      if (!id && !project_id && !main_task && !cust_id) {
        try {
          await redis.set(redisKey, JSON.stringify(mappedResult), "EX", 3600);
        } catch (err) {
          console.warn("Redis cache write failed:", err.message);
        }
      }

      return res.status(200).json({
        message: "Studio subtasks retrieved from database successfully.",
        result: mappedResult,
        project_counts: projectCounts,
        approval_status_counts: approvalStatusCounts,
      });
    } catch (error) {
      console.error("❌ Error retrieving studio subtasks:", error);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve studio subtasks.",
          error: error.message,
        });
      }
    }
  }
}

module.exports = StudiosubtaskController;
