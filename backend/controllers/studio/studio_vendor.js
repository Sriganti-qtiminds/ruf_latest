const DatabaseService = require("../../utils/service"); // Correct import path
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
class StudiovendorsController extends BaseController {
async addNewVendor(req, res) {
  let connection;
  try {
    const { vendorData } = req.body;
    if (!Array.isArray(vendorData) || vendorData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'vendorData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      vendorData.map(({ key, value }) => [key, value])
    );
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);
    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;
    req.body = generateRequestBody("studio_vendors_info", {
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
      throw new Error("Vendor insert failed — insertId not found.");
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
      message: "Vendor added successfully.",
      vendorId: insertId,
    });
  } catch (error) {
    console.error("Error adding vendor:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add vendor.",
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
async getAllVendors(req, res) {
  const { id, ven_cat_id, ven_approval_status } = req.query;
  const curd = new CurdController.UniversalProcedure();
  try {
    const isSimpleQuery = !id && !ven_cat_id && !ven_approval_status;
    const whereClauses = [];
    if (id) whereClauses.push(`sv.id = ${Number(id)}`);
    if (ven_cat_id) whereClauses.push(`sv.ven_cat_id = ${Number(ven_cat_id)}`);
    if (ven_approval_status) whereClauses.push(`sv.ven_approval_status = ${Number(ven_approval_status)}`);
    const whereClause = whereClauses.join(" AND ");
    req.body = generateRequestBody("studio_vendors_info", {
      operationType: "select",
      configKey: "studio_vendors_info",
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
    console.error("Error retrieving vendors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve vendors.",
      error: error.message,
    });
  }
}
async updateVendorRecord(req, res) {
  let connection;
  try {
    const { vendorData } = req.body;
    if (!Array.isArray(vendorData) || vendorData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'vendorData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      vendorData.map(({ key, value }) => [key, value])
    );
    const vendorId = parseInt(fieldValues.id, 10);
    if (!vendorId || isNaN(vendorId)) {
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
    req.body = generateRequestBody("studio_vendors_info", {
      operationType: "update",
      updatekeyvaluepairs: fieldValues,
      whereclause: `id = ${vendorId}`,
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
      message: "Vendor updated successfully.",
      result: dbResponse.result ?? dbResponse,
    });
  } catch (error) {
    console.error("Error updating vendor:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update vendor.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async deleteVendorRecord(req, res) {
  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'id' to delete vendor.",
    });
  }
  const curd = new CurdController.UniversalProcedure();
  try {
    req.body = generateRequestBody("studio_vendors_info", {
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
        message: "No vendor found with the provided ID or deletion failed.",
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
      message: "Vendor deleted successfully.",
      result: dbResponse.result,
    });
  } catch (error) {
    console.error("Error deleting vendor:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete vendor.",
        error: error.message,
      });
    }
  }
}
}
module.exports = StudiovendorsController;