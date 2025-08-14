const {DatabaseService,DatabaseServicestudio} = require("../../utils/service");
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
class StudiouserPaymentController extends BaseController {
async addNewStudiouserPayment(req, res) {
  let connection;
  try {
    const { paymentData } = req.body;
    if (!Array.isArray(paymentData) || paymentData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'paymentData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      paymentData.map(({ key, value }) => [key, value])
    );
    const curd = new CurdController.UniversalProcedure();
    connection = await TransactionController.getConnection();
    curd.dbService.connection = connection;
    await TransactionController.beginTransaction(connection);
    req.body = generateRequestBody("studiouser_payments_info", {
      operationType: "insert",
      fieldValues,
    });
    const { redisKey } = req.body;
    const dbResponse = await curd.executeProcedure(req);
    const insertId =
      dbResponse?.result?.insertId ??
      dbResponse?.insertId ??
      (Array.isArray(dbResponse?.result) ? dbResponse.result[0]?.insertId : null);
    if (!insertId) {
      console.error("Insert failed. DB Response:", JSON.stringify(dbResponse));
      throw new Error("Payment insert failed — insertId not found.");
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
      message: "Payment added successfully.",
      paymentId: insertId,
    });
  } catch (error) {
    console.error("Error adding payment:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add payment.",
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
async  getAllStudiouserPayments(req, res) {
  const { id, project_id } = req.query;
  const curd = new CurdController.UniversalProcedure();
  try {
    const isSimpleQuery = !id && !project_id;
    const whereClauses = [];
    if (id) whereClauses.push(`svp.id = ${Number(id)}`);
    if (project_id) whereClauses.push(`svp.project_id = ${Number(project_id)}`);
    const whereClause = whereClauses.join(" AND ");
    req.body = generateRequestBody("studiouser_payments_info", {
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
    console.error("Error retrieving studio vendor payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve studio vendor payments.",
      error: error.message,
    });
  }
}
async updateStudiouserPayment(req, res) {
  let connection;
  try {
    const { paymentData } = req.body;
    if (!Array.isArray(paymentData) || paymentData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'paymentData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      paymentData.map(({ key, value }) => [key, value])
    );
    const paymentId = parseInt(fieldValues.id, 10);
    if (!paymentId || isNaN(paymentId)) {
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
    req.body = generateRequestBody("studiouser_payments_info", {
      operationType: "update",
      updatekeyvaluepairs: fieldValues,
      whereclause: `id = ${paymentId}`,
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
      message: "Payment updated successfully.",
      result: dbResponse.result ?? dbResponse,
    });
  } catch (error) {
    console.error("Error updating payment:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update payment.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async deleteStudiouserPayment(req, res) {
  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'id' to delete payment.",
    });
  }
  const curd = new CurdController.UniversalProcedure();
  try {
    req.body = generateRequestBody("studiouser_payments_info", {
      operationType: "delete",
      whereclause: `id = ${Number(id)}`
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
        message: "No payment found with the provided ID or deletion failed.",
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
      message: "Payment deleted successfully.",
      result: dbResponse.result,
    });
  } catch (error) {
    console.error("Error deleting payment:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete payment.",
        error: error.message,
      });
    }
  }
}
}
module.exports = StudiouserPaymentController;
