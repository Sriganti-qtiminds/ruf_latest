const {DatabaseService,DatabaseServicestudio} = require("../../utils/service"); // Correct import path
const db = require("../../config/db"); // Database connection object
require("dotenv").config();
const BaseController = require("../../utils/baseClass"); // Adjust the path as needed
const S3Service = require("../../utils/s3"); // Assuming s3Service is
const { S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const redis = require("../../config/redis"); // Import configuration
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/pagination");
const TransactionController = require("../../utils/transaction");
const config = require("../../jsonfiles/studio_info.json");
const { generateRequestBody } = require("../../utils/requestFactory");
const CurdController = require("../curdController");
class StudiouserPaymentplanController extends BaseController {
async addNewUserPaymentplan(req, res) {
  let connection;
  try {
    const { paymentData } = req.body;

    // === Validate request ===
    if (!Array.isArray(paymentData) || paymentData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'paymentData' array.",
      });
    }

    // === Convert array to object ===
    const fieldValues = Object.fromEntries(
      paymentData.map(({ key, value }) => [key, value])
    );

    // === If week_invoice_date or week_due_date provided, keep them as is ===
    // Do not auto-calculate. Just validate + format if necessary
    const formatDate = (d) => {
      if (!d) return null;
      const date = new Date(d);
      if (isNaN(date.getTime())) return null; // invalid date
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    };

    if (fieldValues.week_invoice_date) {
      fieldValues.week_invoice_date = formatDate(fieldValues.week_invoice_date);
    }
    if (fieldValues.week_due_date) {
      fieldValues.week_due_date = formatDate(fieldValues.week_due_date);
    }

    // === DB Transaction Start ===
    const curd = new CurdController.UniversalProcedure();
    connection = await TransactionController.getConnection();
    curd.dbService.connection = connection;
    await TransactionController.beginTransaction(connection);

    // === Insert Payment Record ===
    req.body = generateRequestBody("studio_user_payment_plan_info", {
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
      console.error("Insert failed. DB Response:", JSON.stringify(dbResponse));
      throw new Error("User payment insert failed — insertId not found.");
    }

    // === Commit Transaction ===
    await TransactionController.commitTransaction(connection);
    console.log("Transaction committed successfully.");

    // === Clear Redis Cache ===
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed (read-only replica):", redisErr.message);
        }
      }
    }

    // === Response ===
    return res.status(201).json({
      success: true,
      message: "User payment added successfully.",
      paymentId: insertId,
      week_invoice_date: fieldValues.week_invoice_date || null,
      week_due_date: fieldValues.week_due_date || null,
    });
  } catch (error) {
    console.error("Error adding user payment:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add user payment.",
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
async getAllUserPaymentPlans(req, res) {
  const { id, vendor_id, project_id, task_id, pymt_status } = req.query;
  const curd = new CurdController.UniversalProcedure();

  try {
    const isSimpleQuery = !id && !vendor_id && !project_id && !task_id && !pymt_status;

    const whereClauses = [];
    if (id) whereClauses.push(`supp.id = ${Number(id)}`);
    if (vendor_id) whereClauses.push(`svp.vendor_id = '${vendor_id}'`);
    if (project_id) whereClauses.push(`supp.project_id = ${Number(project_id)}`);
    if (task_id) whereClauses.push(`svp.task_id = ${Number(task_id)}`);
    if (pymt_status) whereClauses.push(`supp.payment_status = '${(Number(pymt_status))}'`);

    const whereClause = whereClauses.length ? whereClauses.join(" AND ") : undefined;

    req.body = generateRequestBody("studio_user_payment_plan_info", {
      operationType: "select",
      whereclause: whereClause
    });

    const { redisKey } = req.body;

    // Try Redis cache first (only for simple queries)
    if (isSimpleQuery && redis?.get) {
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
          console.warn("Redis GET failed (possibly read-only replica):", redisErr.message);
        }
      }
    }

    const dbResponse = await curd.executeProcedure(req);
    const result = dbResponse?.result || [];

    // Cache results if simple query
    if (isSimpleQuery && result.length && redis?.set) {
      try {
        await redis.set(redisKey, JSON.stringify(result));
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis SET failed (possibly read-only replica):", redisErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      source: isSimpleQuery ? "db + cache" : "db",
      result,
    });
  } catch (error) {
    console.error("Error retrieving studio user payment plans:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve studio user payment plans.",
      error: error.message,
    });
  }
}

async updateUserPaymentPlan(req, res) {
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
    req.body = generateRequestBody("studio_user_payment_plan_info", {
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
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed (read-only replica):", err.message);
        }
      }
    }
    return res.status(200).json({
      success: true,
      message: "User payment plan updated successfully.",
      result: dbResponse.result ?? dbResponse,
    });
  } catch (error) {
    console.error("Error updating user payment plan:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update user payment plan.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async deleteStudioUserPaymentPlan(req, res) {
  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'id' to delete user payment plan.",
    });
  }
  const curd = new CurdController.UniversalProcedure();
  try {
    req.body = generateRequestBody("studio_user_payment_plan_info", {
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
        message: "No user payment plan found with the provided ID or deletion failed.",
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
      message: "User payment plan deleted successfully.",
      result: dbResponse.result,
    });
  } catch (error) {
    console.error("Error deleting user payment plan:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete user payment plan.",
        error: error.message,
      });
    }
  }
}
}

module.exports = StudiouserPaymentplanController;
