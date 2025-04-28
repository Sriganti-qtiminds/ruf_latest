const DatabaseService = require("../utils/service"); // Correct import path
const db = require("../config/db"); // Database connection object
const { propertyFields, fieldNames1 } = require("../utils/joins");
require("dotenv").config();
const BaseController = require("../utils/baseClass"); // Adjust the path as needed
const  TransactionController=require("../utils/transaction")

class FMController extends BaseController {


    async getFmList(req, res) {
      const { community_id } = req.query; // Extract community_id from query parameters
  
      try {
        // Define the main table and its alias for the query
        const tableName = `dy_rm_fm_com_map r`; // Main table alias
  
        // Define the JOIN clauses to link the main table with other tables
        const joinClauses = `LEFT JOIN dy_user u ON r.fm_id = u.id
        LEFT JOIN dy_user u2 ON r.rm_id = u2.id
              LEFT JOIN st_community c ON r.community_id = c.id
  `; 
        // Define the fields to select from the database
        const fieldNames = `r.fm_id, u.user_name AS fm_name,
              r.rm_id, u2.user_name AS rm_name,
                    r.community_id, c.name AS community_name
  
  `;  
  
        // If community_id is provided, escape it to prevent SQL injection
        const whereCondition = community_id
          ? `r.community_id = ${db.escape(community_id)}` // Escape community_id to avoid SQL injection
          : "";
  
        // Fetch the data using the DatabaseService
        const results = await this.dbService.getJoinedData(
          tableName,
          joinClauses,
          fieldNames,
          whereCondition
        );
  
        // Check if no records are found
        if (!results || results.length === 0) {
          return res
            .status(404)
            .json({ error: "No records found for the provided community_id." });
        }
  
        // Return the results in a successful response
        res.status(200).json({
          message: "Retrieved successfully.",
          result: results, // List of Facility Managers for the given community_id
        });
      } catch (error) {
        // Log and return any errors that occur during the process
        console.error("Error fetching FM status data:", error.message);
        res.status(500).json({
          error: "An error occurred while fetching FM status data.",
          details: error.message, // Provide the error details for debugging
        });
      }
    }
  }
  module.exports=FMController;