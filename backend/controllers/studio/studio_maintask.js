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
const CurdController = require("../curdController");
const { generateRequestBody } = require("../../utils/requestFactory");
class StudiomaintaskController extends BaseController {
async addNewStudioMainTask(req, res) {
  let connection;
  try {
    const { mainTaskData } = req.body;
    if (!Array.isArray(mainTaskData) || mainTaskData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'mainTaskData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      mainTaskData.map(({ key, value }) => [key, value])
    );
    delete fieldValues["weeks_planned"];
    const parseSafeInt = (v) => {
      const num = parseInt(v, 10);
      return isNaN(num) ? null : num;
    };
    const parseSafeFloat = (v) => {
      const num = parseFloat(v);
      return isNaN(num) ? null : num;
    };
    const parseSafeDate = (v) => {
      const date = new Date(v);
      return isNaN(date.getTime()) ? null : date;
    };
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);
    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;
    req.body = generateRequestBody("studio_main_tasks", {
      operationType: "insert",
      fieldValues,
    });
    const { redisKey } = req.body;
    const dbResponse = await curd.executeProcedure(req);
    const insertId =
      dbResponse?.result?.insertId ??
      dbResponse?.insertId ??
      (Array.isArray(dbResponse?.result)
        ? dbResponse.result[0]?.insertId
        : null);
    if (!insertId) {
      console.error("Insert failed. DB Response:", dbResponse);
      throw new Error("Main task insert failed — insertId not found.");
    }
    await TransactionController.commitTransaction(connection);
    console.log("Transaction committed successfully.");
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed (read-only replica):", redisErr.message);
        }
      }
    }
    return res.status(201).json({
      success: true,
      message: "Main task added successfully.",
      mainTaskId: insertId,
    });
  } catch (error) {
    console.error("Error adding main task:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add main task.",
        error: error.message,
      });
    }
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
      console.log("Connection released.");
    }
  }
}
async  getAllStudioMainTasks(req, res) {
  const { id, project_id } = req.query;
  const curd = new CurdController.UniversalProcedure();
  try {
    const isSimpleQuery = !id && !project_id;
    const whereClauses = [];
    if (id) whereClauses.push(`smt.id = ${Number(id)}`);
    if (project_id) whereClauses.push(`smt.project_id = ${Number(project_id)}`);
    const whereClause = whereClauses.join(" AND ");
    req.body = generateRequestBody("studio_main_tasks", {
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
          console.warn("Redis GET failed (possibly replica/unavailable):", redisErr.message);
        }
      }
    }
    const dbResponse = await curd.executeProcedure(req);
    const result = dbResponse?.result || [];
    if (isSimpleQuery && result.length > 0 && redis && redis.set) {
      try {
        await redis.set(redisKey, JSON.stringify(result));
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis SET failed (possibly replica/unavailable):", redisErr.message);
        }
      }
    }
    return res.status(200).json({
      success: true,
      source: isSimpleQuery ? "db + cache" : "db",
      result,
    });
  } catch (error) {
    console.error("Error retrieving studio main tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve studio main tasks.",
      error: error.message,
    });
  }
}
async updateStudioMainTask(req, res) {
  let connection;
  try {
    const { mainTaskData } = req.body;
    if (!Array.isArray(mainTaskData) || mainTaskData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'mainTaskData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      mainTaskData.map(({ key, value }) => [key, value])
    );
    const mainTaskId = parseInt(fieldValues.id, 10);
    if (!mainTaskId || isNaN(mainTaskId)) {
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
    req.body = generateRequestBody("studio_main_tasks", {
      operationType: "update",
      updatekeyvaluepairs: fieldValues,
      whereclause: `id = ${mainTaskId}`,
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
      message: "Main task updated successfully.",
      result: dbResponse.result ?? dbResponse,
    });
  } catch (error) {
    console.error("Error updating main task:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update main task.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async  deleteStudioMainTask(req, res) {
  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'id' to delete main task.",
    });
  }
  const curd = new CurdController.UniversalProcedure();
  try {
    req.body = generateRequestBody("studio_main_tasks", {
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
        message: "No main task found with the provided ID or deletion failed.",
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
      message: "Main task deleted successfully.",
      result: dbResponse.result,
    });
  } catch (error) {
    console.error("Error deleting main task:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete main task.",
        error: error.message,
      });
    }
  }
}

}
module.exports = StudiomaintaskController ;