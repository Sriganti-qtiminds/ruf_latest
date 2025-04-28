const db = require("../config/db"); // Database connection
require('dotenv').config();
class TransactionController {
    /**
     * Establishes a database connection.
     * @throws {Error} - If the connection cannot be established.
     */
    static async getConnection() {
      try {
        const connection = await db.getConnection();
        if (!connection) {
          throw new Error("Failed to establish a database connection.");
        }
        return connection;
      } catch (error) {
        console.error("Error getting database connection:", error.message);
        throw error;
      }
    }
  
    /**
     * Starts a transaction.
     * @param {Object} connection - Database connection.
     * @throws {Error} - If starting the transaction fails.
     */
    static async beginTransaction(connection) {
      try {
        await connection.beginTransaction();
        console.log("Transaction started.");
      } catch (error) {
        console.error("Error starting transaction:", error.message);
        throw error;
      }
    }
  
    /**
     * Commits a transaction.
     * @param {Object} connection - Database connection.
     * @throws {Error} - If committing the transaction fails.
     */
    static async commitTransaction(connection) {
      try {
        await connection.commit();
        console.log("Transaction committed successfully.");
      } catch (error) {
        console.error("Error committing transaction:", error.message);
        throw error;
      }
    }
  
    /**
     * Rolls back a transaction unconditionally.
     * @param {Object} connection - Database connection.
     * @param {string} reason - Optional reason for rollback.
     */
    static async rollbackTransaction(connection, reason = "") {
      try {
        await connection.rollback();
        console.log(`Transaction successfully rolled back. Reason: ${reason}`);
      } catch (error) {
        console.error("Rollback failed:", error.message);
      }
    }
  
    /**
     * Releases a database connection.
     * @param {Object} connection - Database connection.
     */
    static async releaseConnection(connection) {
      try {
        if (connection) {
          await connection.release();
          console.log("Connection released.");
        }
      } catch (error) {
        console.error("Failed to release connection:", error.message);
        throw error;
      }
    }
  }
module.exports = TransactionController;

