require("dotenv").config();
const TableInfo = require("./studio/tblInfo");
const BaseController = require("../utils/baseClass");
const TransactionController = require("../utils/transaction");

class UniversalProcedure extends BaseController {

  async executeProcedure(req, res = null) {
    let {
      jsonfilename = null,
      configKey = null,
      operationType = null,
      fieldValues = {},
      updatekeyvaluepairs = {},
      whereclause = "",
      aggregatefields = null,
      aggregateclause = null,
      sortfields = null,
      sortorder = "ASC",
    } = req.body;

    const clean = (obj) => {
      if (!obj || typeof obj !== "object") return obj;
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = value === undefined ? null : value;
      }
      return result;
    };

    try {
      const tblInfo = new TableInfo();
      const isLoaded = await tblInfo.getJsonData(jsonfilename, configKey);
      if (!isLoaded) {
        const err = {
          success: false,
          error: `Could not load config for ${configKey}`,
        };
        return res ? res.status(400).json(err) : err;
      }

      await tblInfo.setValues();

      const isWriteOp = ["insert", "update", "delete"].includes(
        operationType.toLowerCase()
      );
      const tableName = isWriteOp
        ? await tblInfo.getRawTableName()
        : await tblInfo.getTableName();

      const tableFields = await tblInfo.getTableFields();
      const joinClause = await tblInfo.getTableJoinClause();

      if (!tableName || !operationType) {
        const err = {
          success: false,
          error: "Missing tableName or operationType",
        };
        return res ? res.status(400).json(err) : err;
      }

      // always returns a flat array or metadata object
      const rawResult = await this.dbServicestudio.callUniversalProcedure(
        operationType,
        tableName,
        tableFields || "*",
        clean(fieldValues),
        clean(updatekeyvaluepairs),
        whereclause || "",
        sortfields || null,
        aggregatefields || null,
        aggregateclause || null,
        joinClause || null,
        sortorder
      );

      // Detect affected rows for write operations
      
      console.log("Type of RawResult : ", typeof rawResult);

      if (Array.isArray(rawResult)) {
        console.log("It is an Array from CurdController");
      } else {
        console.log("It is an object from CurdController");
      }
      //console.log("Result :", rawResult);

      if (!isWriteOp) {        
        const err = {
          success: false,
          error: `No records affected by ${operationType} operation.`,
          result: rawResult,
        };
        return res ? res.status(404).json(err) : err;
      }

      // For select operations, always return an array
      const result = Array.isArray(rawResult)
        ? rawResult
        : rawResult?.result ?? [];

      const success = {
        success: true,
        result,
      };

      return res ? res.status(200).json(success) : success;
    } catch (error) {
      console.error("Error executing procedure:", error);
      const err = {
        success: false,
        error: "An error occurred while executing the procedure.",
        details: error.message,
      };
      return res ? res.status(500).json(err) : err;
    }
  }
}

module.exports = UniversalProcedure;

class AddNewRecord extends BaseController {
  async addNewRecord(req, res) {
    const { jsonfilename, fieldNames, fieldValues } = req.body;

    if (!jsonfilename || !fieldNames || !fieldValues) {
      return res.status(400).json({
        error:
          "Missing required fields: jsonfilename, fieldNames, or fieldValues.",
      });
    }

    let connection;
    try {
      const tblInfo = new TableInfo();
      await tblInfo.getJsonData(jsonfilename);
      await tblInfo.setValues();

      const tableName = await tblInfo.getTableName();
      if (!tableName) {
        return res
          .status(400)
          .json({ error: "Invalid tableName from metadata." });
      }

      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      const result = await this.dbService.addNewRecord(
        tableName,
        fieldNames,
        fieldValues,
        connection
      );

      if (!result || result.affectedRows === 0) {
        await TransactionController.rollbackTransaction(connection);
        return res.status(500).json({ error: "Failed to add the new record." });
      }

      await TransactionController.commitTransaction(connection);

      res.status(200).json({
        message: "Record added successfully.",
        result,
      });
    } catch (error) {
      if (connection)
        await TransactionController.rollbackTransaction(connection);
      console.error("Add record error:", error.message);
      res.status(500).json({
        error: "An error occurred while adding the record.",
        details: error.message,
      });
    } finally {
      if (connection) await TransactionController.releaseConnection(connection);
    }
  }
}

class GetRecords extends BaseController {
  async getRecords(req, res) {
    const { jsonfilename, fieldNames, whereCondition = "" } = req.query;

    if (!jsonfilename || !fieldNames) {
      return res.status(400).json({
        error: "Missing required fields: jsonfilename or fieldNames.",
      });
    }

    try {
      const tblInfo = new TableInfo();
      await tblInfo.getJsonData(jsonfilename);
      await tblInfo.setValues();

      const tableName = await tblInfo.getTableName();

      const results = await this.dbService.getRecordsByFields(
        tableName,
        fieldNames,
        whereCondition
      );

      res.status(200).json({
        message: "Records retrieved successfully.",
        result: results,
      });
    } catch (error) {
      console.error("Fetch records error:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching records.",
        details: error.message,
      });
    }
  }
}

class UpdateRecord extends BaseController {
  async updateRecord(req, res) {
    const { jsonfilename, fieldValuePairs, whereCondition = "" } = req.body;

    if (!jsonfilename || !fieldValuePairs) {
      return res.status(400).json({
        error: "Missing required fields: jsonfilename or fieldValuePairs.",
      });
    }

    let connection;
    try {
      const tblInfo = new TableInfo();
      await tblInfo.getJsonData(jsonfilename);
      await tblInfo.setValues();

      const tableName = await tblInfo.getTableName();

      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      const result = await this.dbService.updateRecord(
        tableName,
        fieldValuePairs,
        whereCondition,
        connection
      );

      await TransactionController.commitTransaction(connection);

      res.status(200).json({
        message: "Record updated successfully.",
        result: result[0],
      });
    } catch (error) {
      if (connection)
        await TransactionController.rollbackTransaction(connection);
      console.error("Update error:", error.message);
      res.status(500).json({
        error: "An error occurred while updating the record.",
        details: error.message,
      });
    } finally {
      if (connection) await TransactionController.releaseConnection(connection);
    }
  }
}

class DeleteRecord1 extends BaseController {
  async deleteRecord(req, res) {
    const { jsonfilename, whereCondition } = req.body;

    if (!jsonfilename || !whereCondition) {
      return res.status(400).json({
        error: "Missing required fields: jsonfilename or whereCondition.",
      });
    }

    let connection;
    try {
      const tblInfo = new TableInfo();
      await tblInfo.getJsonData(jsonfilename);
      await tblInfo.setValues();
      const tableName = await tblInfo.getTableName();

      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      const result = await this.dbService.deleteRecord(
        tableName,
        whereCondition,
        connection
      );

      if (!result || result.affectedRows === 0) {
        await TransactionController.rollbackTransaction(connection);
        return res
          .status(404)
          .json({ error: "No records matched the criteria to delete." });
      }

      await TransactionController.commitTransaction(connection);

      res.status(200).json({
        message: "Record(s) deleted successfully.",
        result,
      });
    } catch (error) {
      if (connection)
        await TransactionController.rollbackTransaction(connection);
      console.error("Delete record error:", error.message);
      res.status(500).json({
        error: "An error occurred while deleting the record(s).",
        details: error.message,
      });
    } finally {
      if (connection) await TransactionController.releaseConnection(connection);
    }
  }
}

class DeleteRecord extends BaseController {
  async deleteRecord(req, res) {
    const { jsonfilename, whereCondition } = req.body;

    if (!jsonfilename || !whereCondition) {
      return res.status(400).json({
        error: "Missing required fields: jsonfilename or whereCondition.",
      });
    }

    let connection;
    try {
      const tblInfo = new TableInfo();
      const jsonLoaded = await tblInfo.getJsonData(jsonfilename);
      if (!jsonLoaded) {
        return res.status(400).json({
          error: `Could not load configuration from ${jsonfilename}.`,
        });
      }

      await tblInfo.setValues();
      let tableName = await tblInfo.getTableName();

      // ✅ Remove alias for DELETE operations (aliases are not allowed in DELETE)
      if (tableName.includes(" ")) {
        tableName = tableName.split(" ")[0];
      }

      // 🔁 Get DB connection and start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      // 🔥 Perform DELETE operation
      const result = await this.dbService.deleteRecord(
        tableName,
        whereCondition,
        connection
      );

      if (!result || result.affectedRows === 0) {
        await TransactionController.rollbackTransaction(connection);
        return res.status(404).json({
          error: "No records matched the criteria to delete.",
        });
      }

      await TransactionController.commitTransaction(connection);

      return res.status(200).json({
        message: "Record(s) deleted successfully.",
        result,
      });
    } catch (error) {
      if (connection)
        await TransactionController.rollbackTransaction(connection);
      console.error("Delete record error:", error.message);
      return res.status(500).json({
        error: "An error occurred while deleting the record(s).",
        details: error.message,
      });
    } finally {
      if (connection) await TransactionController.releaseConnection(connection);
    }
  }
}

module.exports = {
  UniversalProcedure,
  AddNewRecord,
  GetRecords,
  UpdateRecord,
  DeleteRecord,
};
