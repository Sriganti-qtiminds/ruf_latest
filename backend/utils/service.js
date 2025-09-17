const db = require("../config/db"); // Database db
require("dotenv").config();
class DatabaseServicestudio {
  /**
   * constructor of the class
   * initializes conection for the class
   * @param {*} connection -connection objec
   */
  constructor(connection) {
    this.connection = connection || db; // use passed-in connection or default pool
    this.dbname = process.env.DB_NAME;
    this.dbservice = new DatabaseService();
  }

  /**
   * Universal procedure to handle all crud storedprocedures
   *
   * @param {*} operationType - type of operation[select,insert,update,delete etc...]
   * @param {*} tableName - name of the table
   * @param {*} tableFields - interested field names
   * @param {*} fieldValues - values for above field names
   * @param {*} updatekeyvaluepairs - key value pairs for update actionn
   * @param {*} whereclause - conditional arguments
   * @param {*} sortfields - fields order for sorting
   * @param {*} aggregatefields - fields for aggregations[sum,avg,max,min etc...]
   * @param {*} aggregateclause - conditions for aggregations
   * @param {*} joinClause - relationship clause between tables
   * @param {*} sortorder - sorting order Asc, Desc
   * @returns matched data rows
   */
  async callUniversalProcedure(
    operationType,
    tableName,
    tableFields,
    fieldValues,
    updatekeyvaluepairs,
    whereclause,
    sortfields,
    aggregatefields,
    aggregateclause,
    joinClause,
    sortorder
  ) {
    let query = "";
    let result = "";

    //coverts objects in key value pair and  returns a comma seperated string
    const toSetClause = (obj) => {
      return Object.entries(obj)
        .map(([k, v]) => `${k} = ${db.escape(v)}`)
        .join(", ");
    };

    const lowerOp = operationType.toLowerCase();

    // Remove alias for non-SELECT
    if (lowerOp !== "select" && tableName.includes(" ")) {
      tableName = tableName.split(" ")[0]; // e.g. "studio_vendors sv" → "studio_vendors"
    }

    switch (lowerOp) {
      case "insert":

        const payloadKeys = Object.keys(fieldValues)
          .map((col) => `\`${col}\``) // wrap in backticks
          .join(", ");

        const payloadValues = Object.values(fieldValues)
          .map((v) => (typeof v === "number" ? v : `'${v}'`))
          .join(", ");

        console.log("Columns :", payloadKeys);
        console.log("Values :", payloadValues);

        const insertedrows = await this.dbservice.addNewRecord(
          tableName,
          payloadKeys,
          payloadValues
        );
        result = insertedrows;
        //query = `INSERT INTO ${tableName} SET ?`;
        //[result] = await this.connection.query(query, fieldValues);

        console.log("Insert result from DB:", result);
        console.log("Row ID from DB:", result[0].rowId);
        console.log("affectedRows from DB:", result.affectedRows);

        return {
          result: {
            insertId: result[0].rowId,
          },
          insertId: result[0].rowId,
        };

      case "update":        
        if (
          !whereclause ||
          !updatekeyvaluepairs ||
          Object.keys(updatekeyvaluepairs).length === 0
        ) {
          throw new Error("Missing update data or WHERE clause for UPDATE.");
        }
        console.log("Key Values : ", updatekeyvaluepairs);

        const updateClause = toSetClause(updatekeyvaluepairs);
        console.log("update Clause : ", updateClause);        

        const updatedrows = await this.dbservice.updateRecord(
          tableName,
          updateClause,
          whereclause
        );
        console.log("updaterows",updatedrows);
        
        result = updatedrows;
        return {
          
          result,
          
        };

      case "delete":
        if (!whereclause) throw new Error("DELETE requires a WHERE clause.");        
        const deletedrows = await this.dbservice.deleteRecord(
          tableName,
          whereclause
        );

        console.log("Where Clause : ", whereclause);

        result = deletedrows;
        return {
          result,
          affectedRows: result.affectedRows,
        };

      case "select":
        const fields = Array.isArray(tableFields)
          ? tableFields.join(", ")
          : tableFields;
        const outputrows = await this.dbservice.getJoinedData(
          tableName,
          joinClause,
          fields,
          whereclause
        );
        result = Array.isArray(outputrows) ? outputrows : []; //outputrows;
        console.log("Type of Service Result :", typeof(result));

        if (Array.isArray(result)) {
          console.log("It is an Array from Service");
        } else {
          console.log("It is an object from Service");
        }
        //console.log("Result :", result);
        return result;
      
      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }
}
class DatabaseService {
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
      console.log("Result Data : ", rows);

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

  async getRecordsByFields(tableName, fieldNames, whereCondition = "") {
    try {
      const procedureCall = `CALL getRecordsByFields(?, ?, ?);`;
      const [rows] = await db.execute(procedureCall, [
        tableName,
        fieldNames,
        whereCondition,
      ]);
      return rows[0]; // Return the result set
    } catch (error) {
      console.error("Error executing getRecordsByFields:", error.message);
      throw error;
    }
  }

  async updateRecord(
    tableName,
    fieldValuePairs,
    whereCondition = "",
    connection = null
  ) {
    try {
      // If no connection is provided, get a new database connection
      if (!connection) {
        connection = await db.getConnection(); // Get a regular connection if none provided
      }
      

      // Prepare the SQL query      
      const procedureCall = `CALL updateRecord(?, ?, ?);`;

      

      // Execute the query using the provided or obtained connection      
      const [rows] = await db.execute(procedureCall, [
        tableName,
        fieldValuePairs,
        whereCondition,
      ]);

      // If we created the connection inside this method, release it
      if (connection) {
        await connection.release();
      }

      return rows[0]; // Return the result
    } catch (error) {
      console.error("Error executing updateRecord:", error.message);
      throw error;
    }
  }

  async deleteRecord(tableName, whereCondition = "") {
    try {
      const procedureCall = `CALL deleteRecord(?, ?);`;
      console.log(
        `Executing SQL: ${procedureCall} with params: ${tableName}, ${whereCondition}`
      );

      const [rows] = await db.execute(procedureCall, [
        tableName,
        whereCondition,
      ]);
      return rows[0]; // Return the result
    } catch (error) {
      console.error("Error executing deleteRecord:", error.message);
      throw error;
    }
  }

  async getJoinedData(mainTable, joinClauses, fields, whereClause = "") {
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
      

      return rows[0];
    } catch (error) {
      // Log and throw any errors that occur during the query execution.
      console.error("Error executing getJoinedData:", error.message);
      throw error;
    }
  }

  async getGroupedData(
    tableName,
    groupField,
    aggregateField,
    aggregateFunction,
    whereCondition = ""
  ) {
    try {
      // Check if whereCondition is provided
      const procedureCall = `CALL getGroupedData(?, ?, ?, ?, ?);`;

      // Pass the parameters, including the whereCondition (default to an empty string if not provided)
      const [rows] = await db.execute(procedureCall, [
        tableName,
        groupField,
        aggregateField,
        aggregateFunction,
        whereCondition, // This is the new parameter
      ]);

      // Return the first row of the result
      return rows[0];
    } catch (error) {
      console.error("Error executing getGroupedData:", error.message);
      throw error;
    }
  }

  async getAggregateValue(
    tableName,
    fieldName,
    aggregateFunction,
    whereCondition = ""
  ) {
    try {
      const procedureCall = `CALL getAggregateValue(?, ?, ?, ?);`;
      const [rows] = await db.execute(procedureCall, [
        tableName,
        fieldName,
        aggregateFunction,
        whereCondition, // Pass the whereCondition to the stored procedure
      ]);
      return rows[0]; // Return the result
    } catch (error) {
      console.error("Error executing getAggregateValue:", error.message);
      throw error;
    }
  }

  async getTableFields(dbname, tableName) {
    try {
      console.log("DB Name : ", dbname);
      console.log("Table Name : ", tableName);

      const procedureCall = `CALL GetAllColumnsofTable(?, ?);`;
      const [rows] = await db.execute(procedureCall, [dbname, tableName]);

      const result = rows[0].map((r) => r.COLUMN_NAME);

      console.log("Field Names in getTableFields : ", result);

      return rows[0].map((r) => r.COLUMN_NAME);
    } catch (error) {
      console.error("Error executing GetAllColumnsofTable:", error.message);
      throw error;
    }
  }

  async getSortedData(Tbl_Name, Order_Field_Name, Sort_Type) {
    try {
      // Validate the sort direction
      if (!["ASC", "DESC"].includes(Sort_Type)) {
        throw new Error("Invalid sort direction. Use ASC or DESC.");
      }

      // Call the stored procedure `getSortedData` with the provided parameters
      const procedureCall = `CALL getSortedData(?, ?, ?);`;
      const [rows] = await db.execute(procedureCall, [
        Tbl_Name,
        Order_Field_Name,
        Sort_Type,
      ]);

      // Return the result set (usually the first index contains the data)
      return rows[0];
    } catch (error) {
      // Log and throw any errors that occur during the query execution
      console.error("Error executing getSortedData:", error.message);
      throw error;
    }
  }
}
module.exports = { DatabaseService, DatabaseServicestudio };
