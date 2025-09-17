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
const config = require("../../jsonfiles/studio_info.json");
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

    // Convert array to object
    const fieldValues = Object.fromEntries(
      mainTaskData.map(({ key, value }) => [key, value])
    );
    delete fieldValues["weeks_planned"];

    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);

    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;

    // Step 1: Insert main task
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

    // Step 2: Generate main_task_formatted_id
    const projectId = fieldValues.project_id;
    const main_task_formatted_id = `P${projectId}_MT${insertId}`;

    // Step 3: Update record with formatted ID
    req.body = generateRequestBody("studio_main_tasks", {
      operationType: "update",
      updatekeyvaluepairs: { main_task_formatted_id },
      whereclause: `id = ${insertId}`,
    });
    await curd.executeProcedure(req);

    // Commit transaction
    await TransactionController.commitTransaction(connection);

    // Redis cache clear
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Redis delete failed:", redisErr.message);
        }
      }
    }

    // Step 4: Compute main_task_id for API response only
    const main_task_id = `P${projectId}`;

    return res.status(201).json({
      success: true,
      message: "Main task added successfully.",
      mainTaskId: insertId,
      main_task_id, // not stored in DB
      main_task_formatted_id, // stored in DB
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
    }
  }
}



  async getAllStudioMainTasks(req, res) {
    const { id, project_id } = req.query;
    const curd = new CurdController.UniversalProcedure();

    try {
      const isSimpleQuery = !id && !project_id;
      const whereClauses = [];
      if (id) whereClauses.push(`smt.id = ${Number(id)}`);
      if (project_id)
        whereClauses.push(`smt.project_id = ${Number(project_id)}`);
      const whereClause = whereClauses.join(" AND ");

      req.body = generateRequestBody("studio_main_tasks", {
        operationType: "select",
        whereclause: whereClause || undefined,
      });

      const { redisKey } = req.body;

      // Step 1: Try Redis cache (only for simple query: no id, no project_id)
      if (isSimpleQuery && redis?.get) {
        try {
          const cached = await redis.get(redisKey);
          if (cached) {
            return res.status(200).json({
              success: true,
              source: "cache",
              main_task_count: JSON.parse(cached).length,
              result: JSON.parse(cached),
            });
          }
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis GET failed:", redisErr.message);
          }
        }
      }

      // ✅ Step 2: Query DB
      //console.log("Req Data:", req);

      const dbResponse = await curd.executeProcedure(req);
      const rows = dbResponse?.result || [];
      
      console.log("Req Data:", rows);

      // Step 3: Group DB rows into structured tasks
      const grouped = rows.reduce((acc, row) => {
        const taskId = row.id;
        if (!acc[taskId]) {
          acc[taskId] = {
            id: row.id,
            project_id: row.project_id,
            project_name: row.project_name,
            main_task_name: row.main_task_name,
            vendor_id: row.vendor_id,
            vendor_name:row.vendor_name,
            task_cost: row.task_cost,
            sgst_pct: row.sgst_pct,
            cgst_pct: row.cgst_pct,
            total_task_cost: row.total_task_cost,
            signup_pct: row.signup_pct,
            sub_tasks: [],
            completed_count: 0,
            pending_count: 0,
            total_main_tasks: 0,
            total_sub_tasks: 0,
            main_task_status_code: null,
            main_task_status: null,
            week_no: row.week_no,
          };
        }
        if (row.sub_task_name || row.approval_status || row.week_no) {
          acc[taskId].sub_tasks.push({
            approval_status: row.approval_status,
            sub_task_name: row.sub_task_name,
            week_no: row.week_no,
          });
        }
        return acc;
      }, {});

      // Step 4: Calculate completion/pending stats
      const finalResult = Object.values(grouped).map((task) => {
        const statusMap = {};
        task.sub_tasks.forEach((st) => {
          const name = st.sub_task_name;
          if (!statusMap[name]) {
            statusMap[name] = { completed: false, pending: false };
          }
          if (st.approval_status == 45) {
            statusMap[name].completed = true;
          } else if (st.approval_status == 44 || st.approval_status == 43) {
            statusMap[name].pending = true;
          }
        });

        task.completed_count = 0;
        task.pending_count = 0;
        Object.values(statusMap).forEach((status) => {
          if (status.pending) {
            task.pending_count++;
          } else if (status.completed) {
            task.completed_count++;
          }
        });

        task.total_sub_tasks = task.completed_count + task.pending_count;

        if (task.total_sub_tasks === 0) {
          task.main_task_status_code = null;
          task.main_task_status = null;
        } else if (task.pending_count > 0) {
          task.main_task_status_code = 44;
          task.main_task_status = "Pending";
        } else if (task.completed_count > 0 && task.pending_count === 0) {
          task.main_task_status_code = 45;
          task.main_task_status = "Completed";
        }

        return task;
      });

      // Step 5: Count main tasks
      let mainTaskCount = 0;
      if (project_id) {
        mainTaskCount = finalResult.filter(
          (t) => t.project_id === Number(project_id)
        ).length;
      } else {
        mainTaskCount = finalResult.length;
      }

      // ✅ Step 6: Update Redis cache (auto-refresh)
      if (isSimpleQuery && finalResult.length > 0 && redis?.set) {
        try {
          // Cache for 1 hour (3600 seconds)
          await redis.set(redisKey, JSON.stringify(finalResult), "EX", 3600);
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis SET failed:", redisErr.message);
          }
        }
      }

      // Final Response
      return res.status(200).json({
        success: true,
        source: isSimpleQuery ? "db + cache" : "db",
        main_task_count: mainTaskCount,
        result: finalResult,
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

  async getAllStudioMainTaskscount1(req, res) {
    const { id, project_id } = req.query;
    const curd = new CurdController.UniversalProcedure();

    try {
      const isSimpleQuery = !id && !project_id;
      const whereClauses = [];
      if (id) whereClauses.push(`smt.id = ${Number(id)}`);
      if (project_id)
        whereClauses.push(`smt.project_id = ${Number(project_id)}`);
      const whereClause = whereClauses.join(" AND ");

      // Build request body for UniversalProcedure
      req.body = generateRequestBody("studio_main_tasks_info_count", {
        operationType: "select",
        whereclause: whereClause || undefined,
      });

      const { redisKey } = req.body;

      // Try cache if it's a simple query
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
      const rows = dbResponse?.result || [];

      // Group rows by main task
      const grouped = rows.reduce((acc, row) => {
        const taskId = row.id;
        if (!acc[taskId]) {
          acc[taskId] = {
            id: row.id,
            week_no: row.week_no,
            project_id: row.project_id,
            main_task_name: row.main_task_name,
            vendor_id: row.vendor_id,
            start_date: row.start_date,
            end_date: row.end_date,
            task_cost: row.task_cost,
            sgst_pct: row.sgst_pct,
            cgst_pct: row.cgst_pct,
            total_task_cost: row.total_task_cost,
            signup_pct: row.signup_pct,
            sub_tasks: [],
            completed_count: 0,
            pending_count: 0,
            total_main_tasks: 0,
            total_sub_tasks: 0,
            main_task_status_code: null,
            main_task_status: null,
          };
        }

        // Push sub-task only if exists
        if (
          row.sub_task_name ||
          row.approval_status ||
          row.percent_complete !== undefined
        ) {
          acc[taskId].sub_tasks.push({
            approval_status: row.approval_status,
            percent_complete: row.percent_complete,
            sub_task_name: row.sub_task_name,
          });
        }

        return acc;
      }, {});

      // Deduplicate sub_tasks & calculate counts with new rules
      const finalResult = Object.values(grouped).map((task) => {
        const statusMap = {};

        task.sub_tasks.forEach((st) => {
          const name = st.sub_task_name;
          if (!statusMap[name]) {
            statusMap[name] = { completed: false, pending: false };
          }

          // NEW RULE: Complete if percent_complete = 100 & approval_status = 3
          if (st.percent_complete === 100 && st.approval_status === 3) {
            statusMap[name].completed = true;
          } else {
            statusMap[name].pending = true;
          }
        });

        // Reset counts
        task.completed_count = 0;
        task.pending_count = 0;

        // Decide final status for each sub_task
        Object.values(statusMap).forEach((status) => {
          if (status.pending) {
            task.pending_count++; // Pending overrides Completed
          } else if (status.completed) {
            task.completed_count++;
          }
        });

        task.total_sub_tasks = task.completed_count + task.pending_count;

        // Assign main task status
        if (task.total_sub_tasks === 0) {
          task.main_task_status_code = null;
          task.main_task_status = null;
        } else if (task.pending_count > 0) {
          task.main_task_status_code = 44; // pending code
          task.main_task_status = "Pending";
        } else if (task.completed_count > 0 && task.pending_count === 0) {
          task.main_task_status_code = 45; // completed code
          task.main_task_status = "Completed";
        }

        return task;
      });

      // Clear old cache first
      if (isSimpleQuery && redis && redis.del) {
        try {
          await redis.del(redisKey);
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis DEL failed:", redisErr.message);
          }
        }
      }

      // Save to cache (fresh format)
      if (isSimpleQuery && finalResult.length > 0 && redis && redis.set) {
        try {
          await redis.set(redisKey, JSON.stringify(finalResult));
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis SET failed:", redisErr.message);
          }
        }
      }

      return res.status(200).json({
        success: true,
        source: isSimpleQuery ? "db + cache" : "db",
        result: finalResult,
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
  async getAllStudioMainTaskscount2(req, res) {
    const { id, project_id } = req.query;
    const curd = new CurdController.UniversalProcedure();

    try {
      const isSimpleQuery = !id && !project_id;
      const whereClauses = [];
      if (id) whereClauses.push(`smt.id = ${Number(id)}`);
      if (project_id)
        whereClauses.push(`smt.project_id = ${Number(project_id)}`);
      const whereClause = whereClauses.join(" AND ");

      // Build request body for UniversalProcedure
      req.body = generateRequestBody("studio_main_tasks_info_count", {
        operationType: "select",
        whereclause: whereClause || undefined,
      });

      const { redisKey } = req.body;

      // Try cache if it's a simple query
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
      const rows = dbResponse?.result || [];

      // Group rows by (main_task id)
      const grouped = rows.reduce((acc, row) => {
        const taskId = row.id;
        if (!acc[taskId]) {
          acc[taskId] = {
            mask_id: row.id,
            project_id: row.project_id,
            main_task_name: row.main_task_name,
            sub_tasks: [],
            completed_count: 0,
            pending_count: 0,
          };
        }

        // Push only valid sub-task rows
        if (row.sub_task_name) {
          acc[taskId].sub_tasks.push({
            approval_status: row.approval_status,
            percent_complete: row.percent_complete,
            sub_task_name: row.sub_task_name,
          });
        }

        return acc;
      }, {});

      // Deduplicate sub_tasks & calculate counts with new rules
      const finalResult = Object.values(grouped).map((task) => {
        const statusMap = {};

        task.sub_tasks.forEach((st) => {
          const name = st.sub_task_name;
          if (!statusMap[name]) {
            statusMap[name] = { completed: false, pending: false };
          }

          // ✅ NEW RULE: Complete if percent_complete = 100 & approval_status = 3
          if (st.percent_complete === 100 && st.approval_status === 3) {
            statusMap[name].completed = true;
          } else {
            statusMap[name].pending = true;
          }
        });

        // Reset counts
        task.completed_count = 0;
        task.pending_count = 0;

        // Decide final status for each sub_task
        Object.values(statusMap).forEach((status) => {
          if (status.pending) {
            task.pending_count++; // Pending overrides Completed
          } else if (status.completed) {
            task.completed_count++;
          }
        });

        // ✅ Return only required fields
        return {
          mask_id: task.mask_id,
          project_id: task.project_id,
          main_task_name: task.main_task_name,
          completed_count: task.completed_count,
          pending_count: task.pending_count,
        };
      });

      // Clear old cache first
      if (isSimpleQuery && redis && redis.del) {
        try {
          await redis.del(redisKey);
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis DEL failed:", redisErr.message);
          }
        }
      }

      // Save to cache (fresh format)
      if (isSimpleQuery && finalResult.length > 0 && redis && redis.set) {
        try {
          await redis.set(redisKey, JSON.stringify(finalResult));
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis SET failed:", redisErr.message);
          }
        }
      }

      return res.status(200).json({
        success: true,
        source: isSimpleQuery ? "db + cache" : "db",
        result: finalResult,
      });
    } catch (error) {
      console.error("Error retrieving studio main tasks count:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve studio main tasks count.",
        error: error.message,
      });
    }
  }
  async getAllStudioMainTaskscount(req, res) {
    const { id, project_id } = req.query;
    const curd = new CurdController.UniversalProcedure();

    try {
      const isSimpleQuery = !id && !project_id;
      const whereClauses = [];
      if (id) whereClauses.push(`smt.id = ${Number(id)}`);
      if (project_id)
        whereClauses.push(`smt.project_id = ${Number(project_id)}`);
      const whereClause = whereClauses.join(" AND ");

      // Build request body for UniversalProcedure
      req.body = generateRequestBody("studio_main_tasks_info_count", {
        operationType: "select",
        whereclause: whereClause || undefined,
      });

      const { redisKey } = req.body;

      // ✅ Try cache if it's a simple query
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
      const rows = dbResponse?.result || [];

      // Group rows by (main_task id)
      const grouped = rows.reduce((acc, row) => {
        const taskId = row.id;
        if (!acc[taskId]) {
          acc[taskId] = {
            mask_id: row.id,
            project_id: row.project_id,
            main_task_name: row.main_task_name,
            sub_tasks: [],
            completed_count: 0,
            pending_count: 0,
          };
        }

        // Push only valid sub-task rows
        if (row.sub_task_name) {
          acc[taskId].sub_tasks.push({
            approval_status: row.approval_status,
            percent_complete: row.percent_complete,
            sub_task_name: row.sub_task_name,
          });
        }

        return acc;
      }, {});

      // Deduplicate sub_tasks & calculate counts
      let finalResult = Object.values(grouped).map((task) => {
        const statusMap = {};

        task.sub_tasks.forEach((st) => {
          const name = st.sub_task_name;
          if (!statusMap[name]) {
            statusMap[name] = { completed: false, pending: false };
          }

          // ✅ Rule: Complete if percent_complete = 100 & approval_status = 3
          if (st.percent_complete === 100 && st.approval_status === 3) {
            statusMap[name].completed = true;
          } else {
            statusMap[name].pending = true;
          }
        });

        task.completed_count = 0;
        task.pending_count = 0;

        Object.values(statusMap).forEach((status) => {
          if (status.pending) {
            task.pending_count++;
          } else if (status.completed) {
            task.completed_count++;
          }
        });

        return {
          mask_id: task.mask_id,
          project_id: task.project_id,
          main_task_name: task.main_task_name,
          completed_count: task.completed_count,
          pending_count: task.pending_count,
        };
      });

      // Filter: Only tasks with completed_count > 0 or pending_count > 0
      finalResult = finalResult.filter(
        (t) => t.completed_count > 0 || t.pending_count > 0
      );

      // Clear old cache first
      if (isSimpleQuery && redis && redis.del) {
        try {
          await redis.del(redisKey);
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis DEL failed:", redisErr.message);
          }
        }
      }

      // Save to cache (fresh format)
      if (isSimpleQuery && finalResult.length > 0 && redis && redis.set) {
        try {
          await redis.set(redisKey, JSON.stringify(finalResult));
        } catch (redisErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Redis SET failed:", redisErr.message);
          }
        }
      }

      return res.status(200).json({
        success: true,
        source: isSimpleQuery ? "db + cache" : "db",
        result: finalResult,
      });
    } catch (error) {
      console.error("Error retrieving studio main tasks count:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve studio main tasks count.",
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
            console.warn(
              "Redis delete failed (read-only replica):",
              redisErr.message
            );
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
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
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
  
  async deleteStudioMainTask(req, res) {
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
        (Array.isArray(dbResponse?.result)
          ? dbResponse.result[0]?.affectedRows
          : 0);
      if (!affectedRows || affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No main task found with the provided ID or deletion failed.",
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

module.exports = StudiomaintaskController;
