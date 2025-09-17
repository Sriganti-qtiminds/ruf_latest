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
class StudiovendorPaymentController extends BaseController {
async addNewVendorPayment(req, res) {
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
    req.body = generateRequestBody("studio_vendor_payments_info", {
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
      throw new Error("Vendor payment insert failed — insertId not found.");
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
      message: "Vendor payment added successfully.",
      paymentId: insertId,
    });
  } catch (error) {
    console.error("Error adding vendor payment:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add vendor payment.",
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
async getAllVendorPayments(req, res) {
  const { id, vendor_id, project_id, task_id, pymt_status } = req.query;
  const curd = new CurdController.UniversalProcedure();
  try {
    const isSimpleQuery = !id && !vendor_id && !project_id && !task_id && !pymt_status;
    const whereClauses = [];
    if (id) whereClauses.push(`svp.id = ${Number(id)}`);
    if (vendor_id) whereClauses.push(`svp.vendor_id = ${Number(vendor_id)}`);
    if (project_id) whereClauses.push(`svp.project_id = ${Number(project_id)}`);
    if (task_id) whereClauses.push(`svp.task_id = ${Number(task_id)}`);
    if (pymt_status) whereClauses.push(`svp.pymt_status = '${pymt_status}'`);
    const whereClause = whereClauses.join(" AND ");
    req.body = generateRequestBody("studio_vendor_payments_info", {
      operationType: "select",
      whereclause: whereClause || undefined
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
async updateVendorPayment(req, res) {
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
    req.body = generateRequestBody("studio_vendor_payments_info", {
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
      message: "Vendor payment updated successfully.",
      result: dbResponse.result ?? dbResponse,
    });
  } catch (error) {
    console.error("Error updating vendor payment:", error.message);
    if (connection) {
      await TransactionController.rollbackTransaction(connection, error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update vendor payment.",
      error: error.message,
    });
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async deleteVendorPayment(req, res) {
  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'id' to delete vendor payment.",
    });
  }
  const curd = new CurdController.UniversalProcedure();
  try {
    req.body = generateRequestBody("studio_vendor_payments_info", {
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
        message: "No vendor payment found with the provided ID or deletion failed.",
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
      message: "Vendor payment deleted successfully.",
      result: dbResponse.result,
    });
  } catch (error) {
    console.error("Error deleting vendor payment:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete vendor payment.",
        error: error.message,
      });
    }
  }
}
async addNewStudioProject(req, res) {
  let connection;

  try {
    // === Parse project data ===
    const projectData = JSON.parse(req.body.projectData);

    if (!Array.isArray(projectData) || projectData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'projectData' array.",
      });
    }

    const fieldValues = Object.fromEntries(
      projectData.map(({ key, value }) => [key, value])
    );
    delete fieldValues["weeks_planned"];
    fieldValues.project_name = "placeholder";

    // === Begin transaction ===
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);

    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;

    // === Insert project ===
    req.body = generateRequestBody("studio_projects_info", {
      operationType: "insert",
      fieldValues,
    });

    const { redisKey } = req.body;
    const dbResponse = await curd.executeProcedure(req);

    const insertId = dbResponse?.result?.insertId ?? dbResponse?.insertId;
    if (!insertId) throw new Error("Project insert failed — insertId not found.");

    // === Generate project name ===
    const formatDateForName = () => {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, "0")}_${String(
        now.getMonth() + 1
      ).padStart(2, "0")}_${now.getFullYear()}`;
    };

    const generatedProjectName = `P${String(insertId).padStart(
      3,
      "0"
    )}_${formatDateForName()}`;

    req.body = generateRequestBody("studio_projects_info", {
      operationType: "update",
      updatekeyvaluepairs: { project_name: generatedProjectName },
      whereclause: `id = ${insertId}`,
    });

    await curd.executeProcedure(req);

    // === Define S3 paths with projXX ===
    const projectIdSegment = `proj${String(insertId).padStart(2, "0")}`;

    const pdfBasePath = `studio/docs/${projectIdSegment}`;
    const imageBasePath = `studio/media/${projectIdSegment}/images`;
    const videoBasePath = `studio/media/${projectIdSegment}/videos`;

    // === Uploaded files from request ===
 const Images = req.files["Images"] || [];  // must match "Images"
const Videos = req.files["Videos"] || [];  // must match "Videos"
const pdfFiles = req.files["pdfs"] || [];  // must match "pdfs"


    const uploadedFiles = {
      images: [],
      videos: [],
      pdfs: [],
    };

    // === Upload files ===
    try {
      if (Images.length) {
        uploadedFiles.images = await S3Service.uploadImagess(
          Images,
          `${imageBasePath}/`
        );
      }

      if (Videos.length) {
        uploadedFiles.videos = await S3Service.uploadVideos(
          Videos,
          `${videoBasePath}/`
        );
      }

      if (pdfFiles.length) {
        uploadedFiles.pdfs = await S3Service.uploadToS3(pdfFiles, pdfBasePath);
      }
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    // === Paths to save in DB ===
    const imageFolderPath = `${imageBasePath}/`;
    const videoFolderPath = `${videoBasePath}/`;
    const pdfFolderPath = `${pdfBasePath}/`;

    // === Update documents_path in DB ===
    req.body = generateRequestBody("studio_projects_info", {
      operationType: "update",
      updatekeyvaluepairs: {
        documents_path: JSON.stringify({
          images: imageFolderPath,
          videos: videoFolderPath,
          pdfs: pdfFolderPath,
          files: uploadedFiles,
        }),
      },
      whereclause: `id = ${insertId}`,
    });

    await curd.executeProcedure(req);

    // === Commit transaction ===
    await TransactionController.commitTransaction(connection);

    // === Clear Redis cache ===
    if (redis && redis.del && redisKey) {
      try {
        await redis.del(redisKey);
      } catch (err) {
        console.warn("⚠️ Redis delete failed:", err.message);
      }
    }

    // === Response ===
    return res.status(201).json({
      success: true,
      message: "Studio project added successfully.",
      projectId: insertId,
      projectName: generatedProjectName,
      mediaPath: {
        images: imageFolderPath,
        videos: videoFolderPath,
        documents: pdfFolderPath,
        files: uploadedFiles,
      },
    });
  } catch (error) {
    if (connection)
      await TransactionController.rollbackTransaction(connection, error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add studio project.",
        error: error.message,
      });
    }
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
}
module.exports = StudiovendorPaymentController;