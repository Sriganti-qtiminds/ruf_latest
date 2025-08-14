const DatabaseService = require("../utils/service"); // Correct import path
const db = require("../config/db"); // Database connection object
const { propertyFields, fieldNames1 } = require("../utils/joins");
require("dotenv").config();
const BaseController = require("../utils/baseClass"); // Adjust the path as needed


class addNewRecord extends BaseController {


    async addNewRecord(req, res) {
      const { tableName, fieldNames, fieldValues } = req.body; // Extract parameters from the request body
  
      try {
        
        if (!tableName || !fieldNames || !fieldValues) {
          return res.status(400).json({
            error:
              "Missing required fields: tableName, fieldNames, or fieldValues.",
          });
        }
  
        
        const result = await this.dbService.addNewRecord(
          tableName,
          fieldNames,
          fieldValues
        );
  
       
        if (!result || result.affectedRows === 0) {
          return res.status(500).json({
            error: "Failed to add the new record.",
          });
        }
  
       
        res.status(200).json({
          message: "Record added successfully.",
          result: result, // You can return specific fields like insertId or affectedRows
        });
      } catch (error) {
       
        console.error("Error adding new record:", error.message);
        res.status(500).json({
          error: "An error occurred while adding the new record.",
          details: error.message, 
        });
      }
    }
  }
  
  class getRecords extends BaseController {
  
  
    async getRecords(req, res) {
      const { tableName, fieldNames, whereCondition } = req.query; // Extract parameters from query string
  
      try {
        // Validate required parameters
        if (!tableName || !fieldNames) {
          return res.status(400).json({
            error: "Missing required fields: tableName or fieldNames.",
          });
        }
  
        // Fetch the data using the DatabaseService
        const results = await this.dbService.getRecordsByFields(
          tableName,
          fieldNames,
          whereCondition || "" // Default to an empty string if no condition is provided
        );
  
  
        // Return the results in a successful response
        res.status(200).json({
          message: "Records retrieved successfully.",
          result: results, // List of records matching the query
        });
      } catch (error) {
        // Log and return any errors that occur during the process
        console.error("Error fetching records by fields:", error.message);
        res.status(500).json({
          error: "An error occurred while fetching records.",
          details: error.message, // Provide the error details for debugging
        });
      }
    }
  }
  
  class updateRecord extends BaseController {
  
  
    async updateRecord(req, res) {
      const { tableName, fieldValuePairs, whereCondition } = req.body; // Extract parameters from the request body
  
      try {
        // Validate required parameters
        if (!tableName || !fieldValuePairs) {
          return res.status(400).json({
            error: "Missing required fields: tableName or fieldValuePairs.",
          });
        }
  
        // Call the DatabaseService to execute the stored procedure
        const result = await this.dbService.updateRecord(
          tableName,
          fieldValuePairs,
          whereCondition || "" // Default to an empty string if no condition is provided
        );
  
  
        // Return the result in a successful response
        res.status(200).json({
          message: "Record updated successfully.",
          result: result[0], // Result of the update operation
        });
      } catch (error) {
        // Log and return any errors that occur during the process
        console.error("Error updating record:", error.message);
        res.status(500).json({
          error: "An error occurred while updating the record.",
          details: error.message, // Provide the error details for debugging
        });
      }
    }
  }
  
  class deleteRecord extends BaseController {
  
  
    async deleteRecord(req, res) {
      const { tableName, whereCondition } = req.body;
  
      try {
        if (!tableName) {
          return res
            .status(400)
            .json({ error: "Missing required field: tableName." });
        }
        // First, check if the record exists by performing a SELECT query
        const checkRecordExistence = await this.dbService.getRecordsByFields(
          tableName,
          "*",
          whereCondition
        );
  
        if (!checkRecordExistence || checkRecordExistence.length === 0) {
          // If no records are found, return an error
          return res.status(404).json({
            error: `No records found`,
          });
        }
  
        const result = await this.dbService.deleteRecord(
          tableName,
          whereCondition || ""
        );
  
  
        res.status(200).json({
          message: "Record(s) deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting record(s):", error.message);
        res.status(500).json({
          error: "An error occurred while deleting the record(s).",
          details: error.message,
        });
      }
    }
  }
module.exports = {addNewRecord,getRecords,updateRecord,deleteRecord};  