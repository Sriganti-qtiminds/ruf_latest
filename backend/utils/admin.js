const db = require("../config/db"); // Database db
require('dotenv').config();
const TransactionController = require("../utils/transaction");

class AdminManager {
  async getTableNames(prefix) {
    try {
      const query = `
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE ?;`;
      
      const [rows] = await db.execute(query, [process.env.DB_NAME, prefix]);

      // Extract unique table names
      return rows.map(row => row.TABLE_NAME);
    } catch (error) {
      console.error(`Error fetching table names for prefix '${prefix}': ${error.message}`);
      throw new Error(`Failed to fetch table names for prefix '${prefix}'`);
    }
  }

  async getSTTables() {
    return this.getTableNames('st_%'); // Directly fetch static tables
  }

}

module.exports = AdminManager;
