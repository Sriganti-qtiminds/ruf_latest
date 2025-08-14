const DatabaseService = require("../utils/service"); // Correct import path
const db = require("../config/db"); // Database connection object
const { propertyFields, fieldNames1 } = require("../utils/joins");
require("dotenv").config();
const BaseController = require("../utils/baseClass"); // Adjust the path as needed
const S3Service = require("../utils/s3"); // Assuming s3Service is

const { S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const redis = require("../config/redis"); // Import configuration
const { v4: uuidv4 } = require("uuid");
const paginate = require("../utils/pagination");
const TransactionController = require("../utils/transaction");
const config = require("../jsonfiles/rooms_info.json");
const CurdController = require("./curdController");

class testimonialController extends BaseController {
  async addNewTestimonialRecord(req, res) {
  let connection;

  try {
    const fieldValues = { ...req.body };
    const file = req.file;

    // ✅ Step 1: Required field checks
    const requiredFields = [
      "user_id",
      "rating",
      "display_name",
      "description",
      "current_status",
      "city_id",
      "builder_id",
      "project_category",
      "community_id"
    ];

    for (const key of requiredFields) {
      if (
        fieldValues[key] === undefined ||
        fieldValues[key] === null ||
        fieldValues[key] === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${key}`,
        });
      }
    }

    // ✅ Step 2: Validate number fields
    const numericFields = [
      "rating",
      "city_id",
      "builder_id",
      "project_category",
      "community_id"
    ];

    for (const key of numericFields) {
      if (isNaN(Number(fieldValues[key]))) {
        return res.status(400).json({
          success: false,
          message: `Invalid number value for field: ${key}`,
        });
      }
    }

    const rating = Number(fieldValues.rating);
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating should be between 1 and 5",
      });
    }

    if (fieldValues.display_name.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Display name should not exceed 255 characters",
      });
    }

    // ✅ Step 3: Upload image (if present)
    if (file) {
      const imagePath = await S3Service.uploadImage(file, fieldValues.user_id, "testimonial_images");
      if (!imagePath) {
        throw new Error("Image upload failed.");
      }
      fieldValues.image_data = imagePath;
    }

    // ✅ Step 4: Add testimonial_date if not passed
    if (!fieldValues.testimonial_date) {
      const now = new Date();
      fieldValues.testimonial_date = now.toISOString().slice(0, 19).replace("T", " ");
    }

    // ✅ Step 5: DB insert using UniversalProcedure
    connection = await TransactionController.getConnection();
    await TransactionController.beginTransaction(connection);

    const curd = new CurdController.UniversalProcedure();
    curd.dbService.connection = connection;

    const config = {
      jsonfilename: "rooms_info.json",
      configKey: "testimonial_info",
      operationType: "insert",
      fieldValues
    };

    const dbResponse = await curd.executeProcedure({ body: config });

    const insertId =
      dbResponse?.result?.insertId ??
      dbResponse?.insertId ??
      (Array.isArray(dbResponse?.result) ? dbResponse.result[0]?.insertId : null);

    if (!insertId) {
      throw new Error("Testimonial insert failed — insertId not found.");
    }

    await TransactionController.commitTransaction(connection);

    // ✅ Step 6: Update Redis
    const redisKey = "testimonial_records";
    const cached = await redis.get(redisKey);
    const testimonials = cached ? JSON.parse(cached) : [];
    const newTestimonial = { id: insertId, ...fieldValues };
    await redis.set(redisKey, JSON.stringify([...testimonials, newTestimonial]));

    return res.status(201).json({
      success: true,
      message: "Testimonial added successfully.",
      testimonialId: insertId,
      data: newTestimonial
    });

  } catch (error) {
    console.error("Error adding testimonial:", error.message);
    if (connection) await TransactionController.rollbackTransaction(connection);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to add testimonial entry.",
        error: error.message,
      });
    }
  } finally {
    if (connection) {
      await TransactionController.releaseConnection(connection);
    }
  }
}
async getNewtestimonialRecord(req, res) {
  const { id } = req.query;
  const redisKey = "testimonial_records"; // Should match the one in metadata.json
  const curd = new CurdController.UniversalProcedure();

  try {
    // Step 1: Try Redis cache
    let cached = await redis.get(redisKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const filtered = parsed.filter(item => item.current_status == 3 && (!id || item.id == id));

      if (id && filtered.length === 0) {
        return res.status(404).json({
          error: "No testimonial found for the provided ID (from cache)."
        });
      }

      return res.status(200).json({
        message: "Testimonial data retrieved from cache successfully.",
        result: filtered
      });
    }

    // Step 2: Fallback to DB using UniversalProcedure
    const whereCondition = `dyt.current_status = 3${id ? ` AND dyt.id = ${db.escape(id)}` : ""}`;

    req.body = {
      jsonfilename: "rooms_info.json",
      configKey: "testimonial_info", // 👈 this must match the key in metadata.json
      operationType: "select",
      whereclause: whereCondition
    };

    const dbResponse = await curd.executeProcedure(req,res);

    if (!dbResponse || !dbResponse.result || dbResponse.result.length === 0) {
      return res.status(404).json({
        error: "No records found for the provided testimonial ID with status 3."
      });
    }

    const result = dbResponse.result.map(item => ({
      id: item.id,
      name: item.display_name,
      rating: item.rating,
      description: item.description,
      current_status: item.current_status,
      testimonial_date: item.testimonial_date,
      builder_name: item.builder_name,
      community_name: item.community_name,
      city_name: item.city_name,
      user_name: item.user_name,
      email: item.email_id,
      phone: item.mobile_no
    }));

    // Step 3: Save to Redis for future use
    await redis.set(redisKey, JSON.stringify(dbResponse.result), "EX", 3600); // 1 hour

    return res.status(200).json({
      message: "Testimonial data retrieved from database successfully.",
      result
    });
  }catch (error) {
  console.error("Error adding testimonial:", error.message);

 

  // ✅ Only respond if no response was sent earlier
  if (!res.headersSent) {
    return res.status(500).json({
      success: false,
      message: "Failed to add testimonial entry.",
      error: error.message
    });
  }
}
}
async getAllTestimonialRecords(req, res) {
  const { id } = req.query;
  const redisKey = "testimonial_records";
  const curd = new CurdController.UniversalProcedure();

  try {
    // ✅ Case 1: Check Redis Cache (only if `id` is passed and no other filters)
    if (id) {
      const cached = await redis.get(redisKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const filtered = parsed.filter(item => Number(item.id) === Number(id));

        if (filtered.length > 0) {
          return res.status(200).json({
            message: "Testimonial data retrieved from cache successfully.",
            result: filtered
          });
        } else {
          console.warn("⛔ Testimonial ID not found in cache. Falling back to DB...");
        }
      }
    }

    // ✅ Case 2: Build WHERE clause dynamically
    const whereClauses = [];
    if (id) whereClauses.push(`dyt.id = ${Number(id)}`);

    const whereClauseString = whereClauses.length > 0 ? whereClauses.join(" AND ") : "";

    // ✅ Fallback to DB
    req.body = {
      jsonfilename: "rooms_info.json",
      configKey: "testimonial_info",
      operationType: "select",
      whereclause: whereClauseString
    };

    const dbResponse = await curd.executeProcedure(req);

    if (!dbResponse || !dbResponse.result || dbResponse.result.length === 0) {
      return res.status(404).json({
        error: "No testimonial records found."
      });
    }

    // ✅ Format result
    const result = dbResponse.result.map(item => ({
      id: item.id,
      user_id: item.user_id,
      name: item.display_name,
      rating: item.rating,
      description: item.description,
      current_status: item.current_status,
      testimonial_date: item.testimonial_date,
      builder_name: item.builder_name,
      community_name: item.community_name,
      city_name: item.city_name,
      user_name: item.user_name,
      email: item.email_id,
      phone: item.mobile_no,
      project_category: item.project_category_name,
      image_data: item.image_data
    }));

    // ✅ Set cache only if it's a full fetch (no filters)
    if (!id) {
      await redis.set(redisKey, JSON.stringify(result), "EX", 3600);
    }

    return res.status(200).json({
      message: "Testimonial data retrieved from database successfully.",
      result
    });

  } catch (error) {
    console.error("Error retrieving testimonial records:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve testimonial records.",
        error: error.message
      });
    }
  }
}
async  deleteTestimonialRecord(req, res) {
  const { id } = req.query;
  const curd = new CurdController.UniversalProcedure();

  if (!id) {
    return res.status(400).json({
      error: "Testimonial ID is required for deletion."
    });
  }

  try {
    req.body = {
      jsonfilename: "rooms_info.json",
      configKey: "testimonial_info",
      operationType: "delete",
      whereclause: `id = ${db.escape(id)}` // ✅ No alias here
    };

    const dbResponse = await curd.executeProcedure(req); // no `res` here

    const affectedRows =
      dbResponse?.result?.affectedRows ??
      dbResponse?.affectedRows ??
      (Array.isArray(dbResponse?.result) ? dbResponse.result[0]?.affectedRows : 0);

    if (!affectedRows || affectedRows === 0) {
      return res.status(404).json({
        error: "No testimonial found with the provided ID or deletion failed.",
        result: null
      });
    }

    // ✅ Clear Redis Cache
    await redis.del("testimonial_records");

    return res.status(200).json({
      message: "Testimonial deleted successfully.",
      result: dbResponse.result
    });

  } catch (error) {
  console.error("Error adding testimonial:", error.message);

 

  // ✅ Only respond if no response was sent earlier
  if (!res.headersSent) {
    return res.status(500).json({
      success: false,
      message: "Failed to add testimonial entry.",
      error: error.message
    });
  }
}
}
async updateTestimonialRecord(req, res) {
  const {
    id,
    rating,
    image_data,
    description,
    current_status,
    testimonial_date,
  } = req.body;

  const redisKey = "testimonial_records"; // Should match the JSON metadata
  const curd = new CurdController.UniversalProcedure();

  // ✅ Step 1: Validate ID
  if (!id) {
    return res.status(400).json({
      error: "Missing 'id' for update operation."
    });
  }

  // ✅ Step 2: Collect update fields dynamically
  const updateFields = {};
  if (rating !== undefined) updateFields.rating = rating;
  if (image_data !== undefined) updateFields.image_data = image_data;
  if (description !== undefined) updateFields.description = description;
  if (current_status !== undefined) updateFields.current_status = current_status;
  if (testimonial_date !== undefined) updateFields.testimonial_date = testimonial_date;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      error: "No fields provided to update."
    });
  }

  try {
    // ✅ Step 3: Use UniversalProcedure for update
    req.body = {
      jsonfilename: "rooms_info.json",  // ✅ Use correct JSON file
      configKey: "testimonial_info",
      operationType: "update",
      updatekeyvaluepairs: updateFields,
      whereclause: `id = ${db.escape(id)}`
    };

    const dbResponse = await curd.executeProcedure(req);

    const affectedRows =
      dbResponse?.result?.affectedRows ??
      dbResponse?.affectedRows ??
      (Array.isArray(dbResponse?.result) ? dbResponse.result[0]?.affectedRows : 0);

    if (!affectedRows || affectedRows === 0) {
      return res.status(404).json({
        error: "No testimonial found with the provided ID or update failed.",
        result: dbResponse.result ?? null
      });
    }

    // ✅ Step 4: Invalidate Redis cache
    await redis.del(redisKey);

    return res.status(200).json({
      message: "Testimonial updated successfully.",
      result: dbResponse.result
    });

  } catch (error) {
    console.error("Error updating testimonial:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: "An error occurred while updating the testimonial.",
        details: error.message
      });
    }
  }
}

 

}
module.exports = {testimonialController}