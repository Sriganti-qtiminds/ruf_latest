const AdminManager = require("../utils/admin"); // Adjust the path as needed
const DatabaseService = require("../utils/service"); // Correct import path
const db = require("../config/db"); // Database connection object
const { propertyFields, fieldNames1 } = require("../utils/joins");
require("dotenv").config();
const BaseController = require("../utils/baseClass"); // Adjust the path as needed

const paginate = require("../utils/pagination");
const S3Service = require("../utils/s3"); // Assuming s3Service is
const  TransactionController=require("../utils/transaction")

class AdminController extends BaseController {
  async getTablesAndFields(req, res) {
    try {
      const tables = await this.tableManager.getSTTables();

      res.status(200).json({
        message: "Tables and their fields retrieved successfully.",
        tables,
      });
    } catch (error) {
      console.error("Error fetching tables and fields:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching tables and fields.",
        details: error.message,
      });
    }
  }
}

class AdminDasboard extends BaseController {
  async AdminDasboard(req, res) {
    try {
      // Query for total users (count of users)
      const totalUsersRegisters = await this.dbService.getAggregateValue(
        "dy_user",
        "id",
        "COUNT",
        null
      );

      // Query for total properties (current_status = 3) using getAggregateValue
      const totalProperties = await this.dbService.getAggregateValue(
        "dy_property",
        "current_status",
        "COUNT",
        "current_status = 3"
      );

      // Query for pending properties (current_status = 1)
      const pendingProperties = await this.dbService.getAggregateValue(
        "dy_property",
        "current_status",
        "COUNT",
        "current_status = 1"
      );

      // Query for total requests (count of transactions)
      const totalRequests = await this.dbService.getAggregateValue(
        "dy_transactions",
        "id",
        "COUNT",
        null
      );

      // Query for total communities (count of communities where rstatus = 1)
      const totalCommunities = await this.dbService.getAggregateValue(
        "st_community",
        "rstatus",
        "COUNT",
        "rstatus = 1"
      );

      // Return the results in the response
      res.status(200).json({
        message: "Retrieved successfully.",
        result: {
          total_users: totalUsersRegisters[0].result,
          total_properties: totalProperties[0].result,
          pending_properties: pendingProperties[0].result,
          total_requests: totalRequests[0].result,
          total_communities: totalCommunities[0].result,
        },
      });
    } catch (error) {
      console.error(
        "Error fetching property and request stats:",
        error.message
      );
      res.status(500).json({
        error: "An error occurred while fetching the stats.",
        details: error.message, // Provide the error details for debugging
      });
    }
  }
}
class AdminPropDetails extends BaseController {
  async adminPropListings(req, res) {
    try {
      const {
        user_id,
        property_id,
        current_status,
        city,
        builders,
        community,
        hometype,
        availability,
        propertydescription,
        page,
        limit,
      } = req.query;

      const tableName = "dy_property dy";
      const joinClauses = `${propertyFields}
              LEFT JOIN dy_user du ON dy.user_id = du.id
`;
      const fieldNames = `${fieldNames1},
              du.user_name AS owner_name,
        du.mobile_no AS owner_mobile_no
`;

      const whereClauses = [];
      const orderByClause = "ORDER BY dy.id DESC"; // Sort by ID in descending order


      if (user_id) whereClauses.push(`dy.user_id = ${db.escape(user_id)}`);
      if (availability)
        whereClauses.push(`dy.available_date = ${db.escape(availability)}`);
      if (property_id) whereClauses.push(`dy.id = ${db.escape(property_id)}`);
      if (current_status)
        whereClauses.push(`dy.current_status = ${db.escape(current_status)}`);

      const addFilter = (values, alias) => {
        if (values) {
          const arr = values.split(",").map((v) => v.trim());
          const escapedValues = arr.map((v) => db.escape(v)).join(", ");
          whereClauses.push(`${alias} IN (${escapedValues})`);
        }
      };

      addFilter(city, "scity.id");
      addFilter(builders, "sb.id");
      addFilter(community, "sc.id");
      addFilter(hometype, "dy.home_type_id");
      addFilter(propertydescription, "dy.prop_desc_id");

      const whereCondition =
        whereClauses.length > 0 ? whereClauses.join(" AND ") : "1";

      // Fetch data
      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        `${whereCondition} ${orderByClause}`

      );

      // Use the paginate function
      const paginatedData = paginate(
        results,
        parseInt(page) || 1,
        parseInt(limit) || undefined
      );

      // Enhance results with images
      paginatedData.results = await Promise.all(
        paginatedData.results.map(async (property) => {
          const images = property.uid
            ? await S3Service.getPropertyImages(property.uid)
            : [];
          const defaultImages = property.default_images
            ? await S3Service.getCommunityImages(property.default_images)
            : [];

          return {
            ...property,
            images,
            default_img: defaultImages,
          };
        })
      );

      res.status(200).json({
        message: property_id
          ? `Details for property ID: ${property_id}`
          : `All property details`,
        pagination: paginatedData.pagination,
        results: paginatedData.results,
      });
    } catch (error) {
      console.error("Error fetching property details:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching property details.",
        details: error.message,
      });
    }
  }
}
class AdminRequests extends BaseController {
  async adminRequests(req, res) {
    try {
      const { rm_id, fm_id, community_id, builder_id,current_status, page = 1, perPage = 20 } = req.query;


      const mainTable = "dy_transactions dt";
const joinClauses = `
    LEFT JOIN dy_user u1 ON dt.user_id = u1.id
    LEFT JOIN dy_property p ON dt.prop_id = p.id
    LEFT JOIN dy_user u2 ON p.user_id = u2.id
    LEFT JOIN st_community c ON p.community_id = c.id
    LEFT JOIN st_current_status cs ON dt.cur_stat_code = cs.id
    LEFT JOIN dy_rm_fm_com_map rm_map ON p.community_id = rm_map.community_id
    LEFT JOIN dy_user rm_user ON rm_map.rm_id = rm_user.id
    LEFT JOIN dy_user fm_user ON rm_map.fm_id = fm_user.id
`;

const fields = `
    p.id AS property_id,
    dt.id AS transaction_id,
    dt.tr_st_time AS start_time,
    dt.tr_upd_time AS update_time,
    c.id AS community_id,
    c.name AS community_name,
    c.builder_id AS builder_id,
    CONCAT(
        CASE WHEN p.flat_no IS NOT NULL THEN CONCAT('Flat No: ', p.flat_no, ', ') ELSE '' END,
        CASE WHEN p.floor_no IS NOT NULL THEN CONCAT('Floor: ', p.floor_no, ', ') ELSE '' END,
        CASE WHEN p.tower_no IS NOT NULL THEN CONCAT('Tower: ', p.tower_no, ', ') ELSE '' END,
        c.address
    ) AS address,
    u2.user_name AS owner_name,
    u2.mobile_no AS owner_mobile,
    u2.email_id AS owner_email,
    u1.user_name AS tenant_name,
    u1.mobile_no AS tenant_mobile,
    u1.email_id AS tenant_email,
    dt.cur_stat_code AS curr_stat_code_id,
    cs.status_code AS curr_stat_code,
    dt.schedule_date AS schedule_date,
    dt.schedule_time AS schedule_time,
    rm_map.rm_id AS rm_id,
    rm_user.user_name AS rm_name,
    rm_map.fm_id AS fm_id,
    fm_user.user_name AS fm_name
`;

const conditions = [];
const orderByClause = "ORDER BY dt.id DESC"; // Sort by ID in descending order

if (rm_id) conditions.push(`rm_map.rm_id = ${db.escape(rm_id)}`);
if (fm_id) conditions.push(`rm_map.fm_id = ${db.escape(fm_id)}`);
if (community_id) conditions.push(`c.id = ${db.escape(community_id)}`);
if (builder_id) conditions.push(`c.builder_id = ${db.escape(builder_id)}`);
if (current_status) conditions.push(`dt.cur_stat_code = ${db.escape(current_status)}`);

const whereCondition = conditions.length > 0 ? conditions.join(" AND ") : "1 = 1";

const taskResults = await this.dbService.getJoinedData(
    mainTable,
    joinClauses,
    fields,
    `${whereCondition} ${orderByClause}`

);

      // Apply Pagination
      const paginatedTasks = paginate(
        taskResults,
        Number(page),
        Number(perPage)
      );

      // Fetch status data
      const statusCondition = rm_id
        ? 'status_category="RMA" OR status_category="FMA"'
        : fm_id
        ? 'status_category="FMA"'
        : "1 = 1"; // Fetch all statuses if no IDs are provided

      const statusResults = await this.dbService.getRecordsByFields(
        "st_current_status",
        "id, status_code",
        statusCondition
      );

      // If rm_id is provided, fetch associated properties
      let associatedProperties = [];
      if (rm_id) {
        const communityResults = await this.dbService.getRecordsByFields(
          "dy_rm_fm_com_map",
          "community_id",
          `rm_id = ${db.escape(rm_id)}`
        );

        const communityIds = communityResults.map((row) => row.community_id);

        if (communityIds.length > 0) {
          const propertyTable = "dy_property dy";
          const propertyJoinClauses = `
              LEFT JOIN dy_user u1 ON dy.user_id = u1.id
              LEFT JOIN dy_transactions dt ON dy.id = dt.prop_id
              LEFT JOIN dy_user u2 ON dt.user_id = u2.id
            `;
          const propertyFields = `
              dy.id AS property_id,
              dy.community_id,
              u1.user_name AS owner_name,
              u1.mobile_no AS owner_mobile,
              u2.user_name AS tenant_name,
              u2.mobile_no AS tenant_mobile
            `;
          const propertyCondition = `community_id IN (${communityIds.join(
            ", "
          )})`;

          associatedProperties = await this.dbService.getJoinedData(
            propertyTable,
            propertyJoinClauses,
            propertyFields,
            propertyCondition
          );
        }
      }

      // Send response
      return res.status(200).json({
        message: "Data retrieved successfully.",
        pagination: paginatedTasks.pagination,
        result: paginatedTasks.results,
        status: statusResults,
        associatedProperties: associatedProperties,
      });
    } catch (error) {
      console.error("Error in getTasks:", error);
      res.status(500).json({
        error: "An error occurred while retrieving task data.",
        details: error.message,
      });
    }
  }
}
class AdminUserManagement extends BaseController {
  async adminUserManagement(req, res) {
    try {
      const { user_id, page = 1, perPage = 50 } = req.query;

      const tableName = "dy_user";
      const fieldNames = `id as user_id, user_name, mobile_no,role_id,customer_id`;
      const whereClauses = [];

      if (user_id) whereClauses.push(`id = ${db.escape(user_id)}`);

      const whereCondition =
        whereClauses.length > 0 ? whereClauses.join(" AND ") : "1";

      const results = await this.dbService.getRecordsByFields(
        tableName,
        fieldNames,
        `${whereCondition} ORDER BY customer_id DESC`
      );

      // Apply Pagination
      const paginatedData = paginate(
        results,
        Number(page),
        Number(perPage)
      );

      res.status(200).json({
        message: "User data retrieved successfully.",
        pagination: paginatedData.pagination,
        results: paginatedData.results,
      });
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching user data.",
        details: error.message,
      });
    }
  }
}

module.exports = {
  AdminController,
  AdminDasboard,
  AdminPropDetails,
  AdminRequests,
  AdminUserManagement,
};
