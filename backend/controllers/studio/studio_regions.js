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
class StudioregionsController extends BaseController {
async addNewRegionsRecord(req, res) {
  let connection;
  try {
    const { regionData } = req.body;
    if (!Array.isArray(regionData) || regionData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'regionData' array.",
      });
    }
    const fieldValues = Object.fromEntries(
      regionData.map(({ key, value }) => {
        if (key === 'region_desc') {
          if (typeof value === 'object') {
            try {
              return [key, JSON.stringify(value)];
            } catch {
              throw new Error("Invalid JSON object for region_desc.");
            }
          } else if (typeof value === 'string') {
            try {
              JSON.parse(value);
              return [key, value];
            } catch {
              throw new Error("region_desc must be a valid JSON string.");
            }
          }
        }
        return [key, value];
      })
    );
    const curd = new CurdController.UniversalProcedure();
    connection = await TransactionController.getConnection();
    curd.dbService.connection = connection;
    await TransactionController.beginTransaction(connection);
    req.body = generateRequestBody("regions_info", {
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
      throw new Error("Region insert failed — insertId not found.");
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
      message: "Region added successfully.",
      regionId: insertId,
    });
  } catch (error) {
    console.error("Error adding region:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add region.",
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
async getAllRegionRecords(req, res) {
  const { id } = req.query;
  const curd = new CurdController.UniversalProcedure();
  try {
    const isSimpleQuery = !id;
    const whereClauses = [];
    if (id) whereClauses.push(`sr.id = ${Number(id)}`);
    const whereClause = whereClauses.join(" AND ");
    req.body = generateRequestBody("regions_info", {
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
    console.error("Error retrieving region records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve region records.",
      error: error.message,
    });
  }
}
async updateRegionRecord(req, res) {
  let connection;
  try {
    let { regionData } = req.body;
    if (!Array.isArray(regionData) || regionData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'regionData' array.",
      });
    }
    regionData = regionData.map(({ key, value }) => {
      if (key === 'region_desc') {
        if (typeof value === 'object') {
          try {
            return { key, value: JSON.stringify(value) };
          } catch {
            throw new Error("Failed to stringify region_desc JSON object.");
          }
        } else if (typeof value === 'string') {
          try {
            JSON.parse(value); 
            return { key, value };
          } catch {
            throw new Error("region_desc must be valid JSON.");
          }
        } else {
          throw new Error("Invalid value type for region_desc.");
        }
      }
      return { key, value };
    });
    const fieldValues = Object.fromEntries(
      regionData.map(({ key, value }) => [key, value])
    );
    const regionId = parseInt(fieldValues.id, 10);
    if (!regionId || isNaN(regionId)) {
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
    req.body = generateRequestBody("regions_info", {
      operationType: "update",
      updatekeyvaluepairs: fieldValues,
      whereclause: `id = ${regionId}`,
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
      message: "Region record updated successfully.",
      result: dbResponse.result ?? dbResponse,
    });
  } catch (error) {
    console.error("Error updating region:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update region.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async deleteRegionRecord(req, res) {
  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'id' to delete region.",
    });
  }
  const curd = new CurdController.UniversalProcedure();
  try {
    req.body = generateRequestBody("regions_info", {
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
        message: "No region found with the provided ID or deletion failed.",
      });
    }
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (redisErr) {
        console.warn("Redis delete failed (read-only replica):", redisErr.message);
      }
    }
    return res.status(200).json({
      success: true,
      message: "Region deleted successfully.",
      result: dbResponse.result,
    });
  } catch (error) {
    console.error("Error deleting region:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete region.",
        error: error.message,
      });
    }
  }
}
}
module.exports = StudioregionsController;