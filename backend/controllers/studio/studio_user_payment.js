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

    // --- Get DB connection and start transaction ---
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);

    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;

    // --- Generate today's date ---
    const today = new Date();
    const formattedDate = `${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}${today.getFullYear()}`;

    // --- Get last rcv_id for today ---
    const [lastPayment] = await connection.query(
      "SELECT rcv_id FROM studio_user_payments WHERE rcv_id LIKE ? ORDER BY rcv_id DESC LIMIT 1",
      [`${formattedDate}%`]
    );

    let sequence = 1;
    if (lastPayment.length > 0) {
      const lastRcv = lastPayment[0].rcv_id;
      const lastSeq = parseInt(lastRcv.slice(-2), 10);
      sequence = lastSeq + 1;
    }

    const sequenceStr = String(sequence).padStart(2, "0");
    const newRcvId = `${formattedDate}${sequenceStr}`;
    fieldValues.rcv_id = newRcvId;

    // --- Insert payment ---
    const insertReq = generateRequestBody("studiouser_payments_info", {
      operationType: "insert",
      fieldValues
    });

    const dbResponse = await curd.executeProcedure({ body: insertReq });
    const insertId =
      dbResponse?.result?.insertId ??
      dbResponse?.insertId ??
      (Array.isArray(dbResponse?.result) ? dbResponse.result[0]?.insertId : null);

    if (!insertId) throw new Error("Payment insert failed — insertId not found.");

    // --- Commit transaction ---
    await TransactionController.commitTransaction(connection);

    return res.status(201).json({
      success: true,
      message: "Payment added successfully.",
      paymentId: insertId,
      rcv_id: newRcvId
    });

  } catch (error) {
    console.error("Error adding payment:", error.message);
    if (connection) await TransactionController.rollbackTransaction(connection, error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add payment.",
        error: error.message
      });
    }
  } finally {
    if (connection) await TransactionController.releaseConnection(connection);
  }
}
async getAllStudiouserPayments(req, res) {
  const { id, project_id, wk_no, cust_id } = req.query;
  const curd = new CurdController.UniversalProcedure();

  try {
    const isSimpleQuery = !id && !project_id && !wk_no && !cust_id;
    const whereClauses = [];

    if (id) whereClauses.push(`sp.id = ${Number(id)}`);
    if (project_id) whereClauses.push(`stp.id = ${Number(project_id)}`);
    if (wk_no) whereClauses.push(`si.wk_no = ${Number(wk_no)}`);
    if (cust_id) whereClauses.push(`stp.cust_id = '${cust_id}'`);

    const whereClause = whereClauses.join(" AND ");

    req.body = generateRequestBody("studiouser_payments_info", {
      operationType: "select",
      whereclause: whereClause || undefined,
    });

    const { redisKey } = req.body;

    // Try cache first
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

    // Fetch from DB
    const dbResponse = await curd.executeProcedure(req);
    const result = dbResponse?.result || [];

    // Delete old cache before setting new one
    if (isSimpleQuery && redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed (read-only replica):", redisErr.message);
        }
      }
    }

    // ✅ Store fresh cache
    if (isSimpleQuery && result.length > 0 && redis && redis.set) {
      try {
        await redis.set(redisKey, JSON.stringify(result), "EX", 3600); // 1h expiry
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
    console.error("Error retrieving studio user payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve studio user payments.",
      error: error.message,
    });
  }
}

async getAllStudiouserPaymentsweek(req, res) {
  const { id, cust_id, main_task, week_no } = req.query;
  const curd = new CurdController.UniversalProcedure();
  try {
    const isSimpleQuery = !id && !cust_id;
    const whereClauses = [];
    if (id) whereClauses.push(`sp.id = ${Number(id)}`);
    if (cust_id) whereClauses.push(`supp.cust_id = '${cust_id}'`);
    if (main_task) whereClauses.push(`sst.main_task = ${Number(main_task)}`);
    if (week_no) whereClauses.push(`sst.week_no = ${Number(week_no)}`);
    const whereClause = whereClauses.length ? whereClauses.join(" AND ") : "1=1";
    req.body = {
      jsonfilename: "studio_info.json",
      configKey: "studio_user_payments_info_week",
      operationType: "select",
      whereclause: whereClause,
      fields: [
        "sp.id as userpayment_id",
        "sp.inv_id",
        "sp.inv_tot",
        "sp.amt_act",
        "sp.rcv_id",
        "sp.pymt_act_date",
        "stp.id as project_id",
        "stp.project_name",
        "sst.id as subtask_id",
        "sst.main_task",
        "sst.vendor_id",
        "sst.percent_complete",
        "sst.approver_id",
        "sst.media_path",
        "sst.approval_status",
        "sst.sub_task_name",
        "sst.sub_task_description",
        "sst.start_date",
        "sst.end_date",
        "sst.week_no",
      ],
      sortfields: "sp.id",
      sortorder: "ASC",
    };
    const redisKey = `studio_user_payments_weeks:${whereClause}`;
    if (isSimpleQuery && redis?.get) {
      try {
        const cached = await redis.get(redisKey);
        if (cached) {
          return res.status(200).json({
            success: true,
            source: "cache",
            result: JSON.parse(cached)
          });
        }
      } catch (err) {
        console.warn("Redis GET failed:", err.message);
      }
    }
    const dbResponse = await curd.executeProcedure(req);
    const rawRows = dbResponse?.result || [];
    const grouped = rawRows.reduce((acc, row) => {
      const existing = acc.find(p => p.userpayment_id === row.userpayment_id);
      let parsedMediaPath = row.media_path;
      try {
        if (typeof row.media_path === "string") {
          parsedMediaPath = JSON.parse(row.media_path);
        }
      } catch (e) {
        parsedMediaPath = row.media_path;
      }
      const subtask = {
        subtask_id: row.subtask_id,
        main_task_id: row.main_task,
        vendor_id: row.vendor_id,
        percent_complete: row.percent_complete,
        approver_id: row.approver_id,
        approval_status: row.approval_status,
        sub_task_name: row.sub_task_name,
        sub_task_description: row.sub_task_description,
        start_date: row.start_date,
        end_date: row.end_date,
        week_no: row.week_no
      };
      if (existing) {
        existing.subtasks.push(subtask);
      } else {
        acc.push({
          userpayment_id: row.userpayment_id,
          inv_id: row.inv_id,
          inv_tot: row.inv_tot,
          amt_act: row.amt_act,
          rcv_id: row.rcv_id,
          pymt_act_date: row.pymt_act_date,
          project_id: row.project_id,
          project_name: row.project_name,
          subtasks: [subtask]
        });
      }

      return acc;
    }, []);
    const filtered = grouped.map(payment => {
      const validSubtasks = [];
      const groupMap = {};
      payment.subtasks.forEach(st => {
        const key = `${st.main_task}_${st.week_no}`;
        if (!groupMap[key]) groupMap[key] = [];
        groupMap[key].push(st);
      });
      for (const key in groupMap) {
        const subtasks = groupMap[key];
        const allApproved = subtasks.every(st => st.approval_status === 3);
        if (allApproved) {
          validSubtasks.push({ ...subtasks[0] });
        }
      }
      return { ...payment, subtasks: validSubtasks };
    }).filter(p => p.subtasks.length > 0);
    if (isSimpleQuery && redis) {
      try {
        await redis.del(redisKey);
        if (filtered.length > 0) {
          await redis.set(redisKey, JSON.stringify(filtered), "EX", 3600);
        }
      } catch (err) {
        console.warn("Redis SET failed:", err.message);
      }
    }
    return res.status(200).json({
      success: true,
      source: isSimpleQuery ? "db + cache" : "db",
      result: filtered
    });
  } catch (error) {
    console.error("Error retrieving studio user payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve studio user payments.",
      error: error.message
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
