const db = require("../config/db"); // Database db
require('dotenv').config();


class DatabaseService {

  async addNewRecord1(tableName, fieldNames, fieldValues) {
    try {
      
      // Pass raw values (no parentheses) to the stored procedure
      const [rows] = await db.execute(`CALL addNewRecord(?, ?, ?)`, [
        tableName,
        fieldNames,
        fieldValues,
      ]);
  
      return rows[0]; // Return the result
    } catch (error) {
      console.error('Error executing addNewRecord:', error.message);
      throw error;
    }
  }
  async addNewRecord(tableName, fieldNames, fieldValues, connection = null) {
    try {
      // If no connection is passed, get a default connection
      if (!connection) {
        connection = await db.getConnection(); // Get a regular connection if none provided
      }
  
      // Execute the query
      const [rows] = await connection.execute(`CALL addNewRecord(?, ?, ?)`, [
        tableName,
        fieldNames,
        fieldValues,
      ]);
  
      // If the connection was obtained inside this method (i.e., it wasn't passed), release it
      if (!connection) {
        await connection.release();
      }
  
      // Return the result
      return rows[0];
    } catch (error) {
      console.error("Error executing addNewRecord:", error.message);
      throw error;
    }
  }

  async getRecordsByFields(tableName, fieldNames, whereCondition = '') {
    try {
      const procedureCall = `CALL getRecordsByFields(?, ?, ?);`;
      const [rows] = await db.execute(procedureCall, [
        tableName,
        fieldNames,
        whereCondition,
      ]);
      return rows[0]; // Return the result set
    } catch (error) {
      console.error('Error executing getRecordsByFields:', error.message);
      throw error;
    }
  }

  async updateRecord1(tableName, fieldValuePairs, whereCondition = '') {
    try {
      // Construct the SET clause dynamically from fieldValuePairs
      let setClause = '';
      for (const [key, value] of Object.entries(fieldValuePairs)) {
        if (setClause !== '') {
          setClause += ', ';
        }
        setClause += `${key} = ?`;
      }
  
      // Prepare the full SQL query
      const procedureCall = `UPDATE ${tableName} SET ${setClause} WHERE ${whereCondition};`;
  
      // Prepare the values for the placeholders in the query
      const values = Object.values(fieldValuePairs);
  
      // Execute the query
      const [rows] = await db.execute(procedureCall, values);
  
      return rows; // Return the result
    } catch (error) {
      console.error('Error executing updateRecord:', error.message);
      throw error;
    }
  }
  async updateRecord(tableName, fieldValuePairs, whereCondition = '', connection = null) {
    try {
        // If no connection is provided, get a new database connection
        let ownConnection = false;
        if (!connection) {
            connection = await db.getConnection();
            ownConnection = true; // Flag to release connection later
        }
  
        // Construct the SET clause dynamically from fieldValuePairs
        let setClause = Object.entries(fieldValuePairs)
            .map(([key]) => `${key} = ?`)
            .join(', ');
  
        // Prepare the SQL query
        const procedureCall = `UPDATE ${tableName} SET ${setClause} WHERE ${whereCondition}`;
  
        // Prepare the values for the placeholders in the query
        const values = Object.values(fieldValuePairs);
  
        // Execute the query using the provided or obtained connection
        const [rows] = await connection.execute(procedureCall, values);
  
        // If we created the connection inside this method, release it
        if (ownConnection) {
            await connection.release();
        }
  
        return rows; // Return the result
    } catch (error) {
        console.error('Error executing updateRecord:', error.message);
        throw error;
    }
  }

  async deleteRecord(tableName, whereCondition = '') {
    try {
      const procedureCall = `CALL deleteRecord(?, ?);`;
      console.log(`Executing SQL: ${procedureCall} with params: ${tableName}, ${whereCondition}`);

      const [rows] = await db.execute(procedureCall, [
        tableName,
        whereCondition,
      ]);
      return rows[0]; // Return the result
    } catch (error) {
      console.error('Error executing deleteRecord:', error.message);
      throw error;
    }
  }

    
  async getJoinedData(mainTable, joinClauses, fields, whereClause = '') {
    
    try {

      // Call the stored procedure `getJoinedData` with the provided parameters.
      const procedureCall = `CALL getJoinedData(?, ?, ?, ?);`;

      
      // Execute the stored procedure using db.execute with the parameters passed to the method.
      const [rows] = await db.execute(procedureCall, [
        mainTable,
        joinClauses,
        fields,
        whereClause,
      ]);
      
      // Return the result set, typically in the first index of the rows array.
      return rows[0]; // The result set is usually in the first index.
    } catch (error) {
      // Log and throw any errors that occur during the query execution.
      console.error('Error executing getJoinedData:', error.message);
      throw error;
    }
  }

   async getGroupedData(tableName, groupField, aggregateField, aggregateFunction, whereCondition = '') {
    try {


        // Check if whereCondition is provided
        const procedureCall = `CALL getGroupedData(?, ?, ?, ?, ?);`;

        // Pass the parameters, including the whereCondition (default to an empty string if not provided)
        const [rows] = await db.execute(procedureCall, [
            tableName,
            groupField,
            aggregateField,
            aggregateFunction,
            whereCondition,  // This is the new parameter
        ]);

        // Return the first row of the result
        return rows[0];
    } catch (error) {
        console.error('Error executing getGroupedData:', error.message);
        throw error;
    }
}


  async getAggregateValue(tableName, fieldName, aggregateFunction, whereCondition = '') {
    try {
      const procedureCall = `CALL getAggregateValue(?, ?, ?, ?);`;
      const [rows] = await db.execute(procedureCall, [
        tableName,
        fieldName,
        aggregateFunction,
        whereCondition // Pass the whereCondition to the stored procedure
      ]);
      return rows[0]; // Return the result
    } catch (error) {
      console.error('Error executing getAggregateValue:', error.message);
      throw error;
    }
}


  async getSortedData(Tbl_Name, Order_Field_Name, Sort_Type) {
    try {
      // Validate the sort direction
      if (!['ASC', 'DESC'].includes(Sort_Type)) {
        throw new Error('Invalid sort direction. Use ASC or DESC.');
      }

      // Call the stored procedure `getSortedData` with the provided parameters
      const procedureCall = `CALL getSortedData(?, ?, ?);`;
      const [rows] = await db.execute(procedureCall, [
        Tbl_Name,
        Order_Field_Name,
        Sort_Type
      ]);
      
      // Return the result set (usually the first index contains the data)
      return rows[0];
    } catch (error) {
      // Log and throw any errors that occur during the query execution
      console.error('Error executing getSortedData:', error.message);
      throw error;
    }
  }

}

module.exports = DatabaseService;
