const DatabaseService = require("../../utils/service"); // Correct import path
const db = require("../../config/db"); // Database connection object
const { propertyFields, fieldNames1 } = require("../../utils/joins");
require("dotenv").config();
const BaseController = require("../../utils/baseClass"); // Adjust the path as needed
const S3Service = require("../../utils/s3"); // Assuming s3Service is

const { S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const redis = require("../../config/redis"); // Import configuration
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/pagination");
const TransactionController = require("../../utils/transaction");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");



const credentials = JSON.parse(process.env.GOOGLE_CREDS);
const client = new BetaAnalyticsDataClient({ credentials });

class StudioController extends BaseController {
  /**
   * Retrieves Room Info for  a specific room if room_id is passed
   * else Retrieves Info of all rooms categoriezed by budget_type
   * @param {*} req
   * @param {*} res
   * @param {room_id} optional parameter to be passed as per requirement
   * @returns AllRooms Info or Speciic Room Info
   */

  async getRoomsInfo(req, res) {
    const { room_id } = req.body;
    const redisKey = "studio_rooms";

    try {
      let roomsInfo = await redis.get(redisKey);
      if (roomsInfo) {
        roomsInfo = JSON.parse(roomsInfo);
        const filterRooms = (data) => {
          const filtered = {};
          for (const [key, rooms] of Object.entries(data)) {
            const matches = rooms.filter((r) => r.room_id == room_id);
            if (matches.length) filtered[key] = matches;
          }
          return filtered;
        };

        const result = room_id ? filterRooms(roomsInfo) : roomsInfo;

        if (room_id && Object.keys(result).length === 0) {
          return res.status(404).json({
            error: "No room found for the provided room ID (from cache).",
          });
        }

        return res.status(200).json({
          message: "Studio rooms info retrieved from cache successfully.",
          result,
        });
      }

      // Cache miss - fetch from DB
      const tableName = "studio_rooms sr";
      const joinClauses = `
        LEFT JOIN studio_area_type sat ON sr.area_type_id = sat.area_id
        LEFT JOIN studio_budget_type sbt ON sr.budget_type_id = sbt.budget_id
      `;
      const fieldNames = `
        sr.room_id as room_id,
        sr.room_desc as room_description,
        sr.image_count as images_count,
        sat.area_type as area_type,
        sbt.budget_desc as budget_type
      `;
      const whereCondition = room_id
        ? `sr.room_id = ${db.escape(room_id)}`
        : "";

      const rawResults = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );
      if (!rawResults || rawResults.length === 0) {
        return res
          .status(404)
          .json({ error: "No room found for the provided room ID." });
      }

      const freshResult = rawResults.reduce((acc, row) => {
        const key = (row.budget_type || "unknown").toLowerCase();
        let description = "";
        try {
          description =
            typeof row.room_description === "string"
              ? JSON.parse(row.room_description)?.Description || ""
              : row.room_description?.Description || "";
        } catch {
          description = "";
        }
        if (!acc[key]) acc[key] = [];
        acc[key].push({
          room_id: row.room_id,
          room_desc: description,
          image_count: row.images_count,
          area_type: row.area_type,
        });
        return acc;
      }, {});

      await redis.set(redisKey, JSON.stringify(freshResult), "EX", 3600);

      const result = room_id
        ? Object.fromEntries(
            Object.entries(freshResult).filter(([_, rooms]) =>
              rooms.some((r) => r.room_id == room_id)
            )
          )
        : freshResult;

      return res.status(200).json({
        message: "Studio rooms info retrieved from database successfully.",
        result,
      });
    } catch (error) {
      console.error("Error fetching studio rooms data:", error);
      return res.status(500).json({
        error: "An error occurred while fetching studio rooms data.",
        details: error.message,
      });
    }
  }

  /**
   * Add a New Room Info Record
   * @param {*} req
   * @param {*} res
   * @param {area_type_id} Area_type_Id which is a foreign Key Value
   * @param {budget_type_id} budget_type_id which is a foreign Key Value
   * @param {image_count} image_count which must be a value > 0 to ensure atleast one image is present
   * @param {room_description} room_description It is a Json Data String for description of the room
   * @returns Returns room_id of newly added row
   */

  async AddRoomInfo(req, res) {
    const { parameters } = req.body;
    const tablename = "studio_rooms";
    if (!Array.isArray(parameters) || parameters.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Missing parameters array." });

    const fieldMap = Object.fromEntries(
      parameters.map(({ key, value }) => [key, value])
    );
    const required = [
      "area_type_id",
      "budget_type_id",
      "image_count",
      "room_desc",
    ];
    for (const key of required)
      if (fieldMap[key] === undefined)
        return res
          .status(400)
          .json({ success: false, message: `Missing field: ${key}` });

    try {
      if (typeof fieldMap.room_desc !== "string")
        fieldMap.room_desc = JSON.stringify(fieldMap.room_desc);

      const connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      const fields = Object.keys(fieldMap).join(", ");
      console.log("Fields : ", fields);

      const values = Object.values(fieldMap)
        .map((value) => db.escape(value))
        .join(", ");

      console.log("Values : ", values);
      const result = await this.dbService.addNewRecord(
        tablename,
        fields,
        values,
        connection
      );

      await TransactionController.commitTransaction(connection);
      await TransactionController.releaseConnection(connection);

      const cacheKey = "studio_rooms";
      const cached = await redis.get(cacheKey);
      const rooms = cached ? JSON.parse(cached) : [];
      const newRoom = { id: result.insertId, ...fieldMap };
      await redis.set(cacheKey, JSON.stringify([...rooms, newRoom]));

      res
        .status(201)
        .json({ success: true, message: "Room added.", data: newRoom });
    } catch (error) {
      console.error("AddRoomInfo Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Server error.",
        error: error.message,
      });
    }
  }

  /**
   * update an existing Room Info
   * @param {*} req
   * @param {*} res
   * @param {room_id} room_id which is a primary Key Value
   * @param {keyValuePairs} keyValuePairs Key Value pairs to update
   * @returns Returns room_id of newly added row
   */

  async UpdateRoomInfo(req, res) {
    try {
      const { fields } = req.body;

      const tablename = "studio_rooms";

      if (!Array.isArray(fields) || fields.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Fields array is required." });
      }

      const fieldMap = Object.fromEntries(
        fields.map(({ key, value }) => {
          if (!key || value === undefined)
            throw new Error("Invalid key-value pair.");
          return [key, key === "room_desc" ? JSON.stringify(value) : value];
        })
      );

      const roomId = fieldMap.room_id;
      if (!roomId)
        return res
          .status(400)
          .json({ success: false, message: "room_id is required." });
      delete fieldMap.room_id;

      if (!Object.keys(fieldMap).length) {
        return res
          .status(400)
          .json({ success: false, message: "No fields provided to update." });
      }

      const result = await this.dbService.updateRecord(
        "studio_rooms",
        fieldMap,
        `room_id = ${db.escape(roomId)}`
      );

      res.status(200).json({
        success: true,
        message: "Room information updated successfully.",
        result,
      });
    } catch (error) {
      const msg = error.message.includes("Invalid key-value")
        ? error.message
        : "Failed to update room information.";
      res
        .status(500)
        .json({ success: false, message: msg, error: error.message });
    }
  }

  /**
   * Delete a complete row  based on room_id which is primary key
   * @param {*} req
   * @param {*} res
   * @param {room_id} room_id which is a primary Key Value
   * @returns Returns room_id of newly added row
   */

  async DeleteRoomInfo(req, res) {
    try {
      const { room_id } = req.body;
      const tablename = "studio_rooms";
      if (!room_id)
        return res
          .status(400)
          .json({ success: false, message: "room_id is required." });

      const whereCondition = room_id
        ? `sr.room_id = ${db.escape(room_id)}`
        : "";
    } catch (error) {
      const msg = error.message.includes("Invalid Room Id")
        ? error.message
        : "Failed to delete room information.";
      res
        .status(500)
        .json({ success: false, message: msg, error: error.message });
    }
    const { room_id } = req.body;
  }
}

module.exports = StudioController;
