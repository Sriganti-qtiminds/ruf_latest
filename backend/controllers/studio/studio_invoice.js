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
const config = require("../../jsonfiles/studio_info.json");
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
        message: "Missing or invalid 'invoiceData' array."
      });
    }
    const fieldValues = Object.fromEntries(
      invoiceData.map(({ key, value }) => [key, value])
    );
    const proj_id = fieldValues.proj_id;
    const wk_no = fieldValues.week_no || fieldValues.wk_no;
    if (!proj_id || !wk_no) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: proj_id and week_no (or wk_no)."
      });
    }
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);
    const [subtasks] = await connection.query(
      "SELECT s.id, s.sub_task_name, s.percent_complete, s.approval_status " +
      "FROM studio_sub_tasks s " +
      "JOIN studio_main_tasks m ON s.main_task = m.id " +
      "WHERE m.project_id = ? AND s.week_no = ?",
      [proj_id, wk_no]
    );
    if (!subtasks.length) {
      await TransactionController.rollbackTransaction(connection, "No subtasks found for this week.");
      return res.status(404).json({
        success: false,
        message: "No subtasks found for the given project/week."
      });
    }
    const incompleteSubtasks = subtasks.filter(st => st.percent_complete < 100);
    if (incompleteSubtasks.length > 0) {
      await TransactionController.rollbackTransaction(connection, "Incomplete subtasks found.");
      return res.status(200).json({
        success: false,
        message: "Invoice cannot be created. Pending subtasks exist.",
        incomplete_subtasks: incompleteSubtasks
      });
    }
    const today = new Date();
    const formattedDate =
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0") +
      today.getFullYear();
    const [lastInvoice] = await connection.query(
      "SELECT inv_info FROM studio_invoices WHERE inv_info LIKE ? ORDER BY inv_info DESC LIMIT 1",
      [formattedDate + "%"]
    );
    let sequence = 1;
    if (lastInvoice.length > 0) {
      const lastInv = lastInvoice[0].inv_info;
      const lastSeq = parseInt(lastInv.slice(-2), 10);
      sequence = lastSeq + 1;
    }
    fieldValues.inv_info = formattedDate + String(sequence).padStart(2, "0");
    if (!fieldValues.inv_status) fieldValues.inv_status = 1;
    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;
    req.body = generateRequestBody("invoices", {
      operationType: "insert",
      fieldValues
    });
    const dbResponse = await curd.executeProcedure(req);
    const insertId = dbResponse?.result?.insertId ?? dbResponse?.insertId;
    if (!insertId) throw new Error("Invoice insert failed — insertId not found.");
    await TransactionController.commitTransaction(connection);
    const redisKey = req.body.redisKey;
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed (read-only replica):", err.message);
        }
      }
    }
    return res.status(201).json({
      success: true,
      message: "Invoice added successfully.",
      invoiceId: insertId,
      inv_info: fieldValues.inv_info
    });
  } catch (error) {
    console.error("Error adding invoice:", error.message);
    if (connection) await TransactionController.rollbackTransaction(connection, error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add invoice.",
        error: error.message
      });
    }
  } finally {
    if (connection) await TransactionController.releaseConnection(connection);
  }
}
async getAllInvoiceRecords(req, res) {
  const { id, status, proj_id } = req.query;   // ⬅ include proj_id
  const curd = new CurdController.UniversalProcedure();

  try {
    // check if this is a “simple” query (no filters)
    const isSimpleQuery = !id && !status && !proj_id;

    // build WHERE clause
    const whereClauses = [];
    if (id) whereClauses.push(`si.id = ${Number(id)}`);
    if (status) whereClauses.push(`si.inv_status = ${Number(status)}`);
    if (proj_id) whereClauses.push(`si.proj_id = ${Number(proj_id)}`); // ⬅ new filter

    const whereClause = whereClauses.join(" AND ");

    // build request for UniversalProcedure
    req.body = generateRequestBody("invoices", {
      operationType: "select",
      whereclause: whereClause || undefined,
    });

    const { redisKey } = req.body;

    // try cache only if no filters
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

    // query database
    const dbResponse = await curd.executeProcedure(req);
    const result = dbResponse?.result || [];

    // cache only if simple query
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