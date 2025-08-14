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
class StudioinvoiceController extends BaseController {
async addNewInvoiceRecord(req, res) {
  let connection;
  try {
    const { invoiceData } = req.body;
    if (!Array.isArray(invoiceData) || invoiceData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'invoiceData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      invoiceData.map(({ key, value }) => [key, value])
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
    const projId = fieldValues.proj_id ?? "NA";
    const weekNo = fieldValues.wk_no ?? "NA";
    fieldValues.inv_info = `STD_INV_${formattedDate}_${projId}_${weekNo}`;
    if (!fieldValues.inv_status) {
      fieldValues.inv_status = 1;
    }
    const curd = new CurdController.UniversalProcedure();
    connection = await TransactionController.getConnection();
    curd.dbService.connection = connection;
    await TransactionController.beginTransaction(connection);
    req.body = generateRequestBody("invoices", {
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
      throw new Error("Invoice insert failed — insertId not found.");
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
      message: "Invoice added successfully.",
      invoiceId: insertId,
    });
  } catch (error) {
    console.error("Error adding invoice:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add invoice.",
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
async getAllInvoiceRecords(req, res) {
  const { id, status } = req.query;
  const curd = new CurdController.UniversalProcedure();
  try {
    const isSimpleQuery = !id && !status;
    const whereClauses = [];
    if (id) whereClauses.push(`si.id = ${Number(id)}`);
    if (status) whereClauses.push(`si.inv_status = ${Number(status)}`);
    const whereClause = whereClauses.join(" AND ");
    req.body = generateRequestBody("invoices", {
      operationType: "select",
      whereclause: whereClause || undefined
    });
    const { redisKey } = req.body;
    if (isSimpleQuery) {
      const cached = await redis.get(redisKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          source: "cache",
          result: JSON.parse(cached),
        });
      }
    }
    const dbResponse = await curd.executeProcedure(req);
    const result = dbResponse?.result || [];
    if (isSimpleQuery && result.length > 0) {
      await redis.set(redisKey, JSON.stringify(result));
    }
    return res.status(200).json({
      success: true,
      source: isSimpleQuery ? "db + cache" : "db",
      result,
    });
  } catch (error) {
    console.error("Error retrieving invoice records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve invoice records.",
      error: error.message,
    });
  }
}
async updateInvoiceRecord(req, res) {
  let connection;
  try {
    const { invoiceData } = req.body;
    if (!Array.isArray(invoiceData) || invoiceData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'invoiceData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      invoiceData.map(({ key, value }) => [key, value])
    );
    const invoiceId = parseInt(fieldValues.id, 10);
    if (!invoiceId || isNaN(invoiceId)) {
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
    req.body = generateRequestBody("invoices", {
      operationType: "update",
      updatekeyvaluepairs: fieldValues,
      whereclause: `id = ${invoiceId}`
    });
    const { redisKey } = req.body;
    const dbResponse = await curd.executeProcedure(req);
    await TransactionController.commitTransaction(connection);
    if (redisKey) {
      try {
        await redis.del(redisKey);
      } catch (err) {
        console.warn(`Failed to clear Redis cache for '${redisKey}':`, err.message);
      }
    }
    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully.",
      result: dbResponse.result ?? dbResponse
    });
  } catch (error) {
    console.error("Error updating invoice:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update invoice.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async deleteInvoiceRecord(req, res) {
  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'id' to delete invoice.",
    });
  }
  const curd = new CurdController.UniversalProcedure();
  try {
    req.body = generateRequestBody("invoices", {
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
        message: "No invoice found with the provided ID or deletion failed.",
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
      message: "Invoice deleted successfully.",
      result: dbResponse.result,
    });
  } catch (error) {
    console.error("Error deleting invoice:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete invoice.",
        error: error.message,
      });
    }
  }
}
}
module.exports = StudioinvoiceController;