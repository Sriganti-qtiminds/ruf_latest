require("dotenv").config();
const fs = require("fs");
const path = require("path");

const folderPath = "../../jsonfiles/";

class TableInfo {
  constructor() {
    this.jsonfilepath = "";
    this.jsonData = {};
    this.tblName = "";
    this.redisKey = "";
    this.tblFields = "";
    this.tblJoinClause = "";
    this.tblWhereClause = "";
  }

  async getJsonData(jsonfilename) {
    try {
      this.jsonfilepath = path.join(__dirname, folderPath, jsonfilename);
      console.log("Reading JSON file:", this.jsonfilepath);

      const fileContent = fs.readFileSync(this.jsonfilepath, "utf-8");
      this.jsonData = JSON.parse(fileContent);

      return this.jsonData;
    } catch (error) {
      console.error("JSON file does not exist or is invalid:", error.message);
      return null;
    }
  }

  async setValues() {
    if (!this.jsonData.tbl_info) {
      console.error("JSON data missing 'tbl_info' key.");
      return;
    }

    const { tbl_info } = this.jsonData;

    this.tblName = await this.getParsedValue(tbl_info.tbl_name);
    this.redisKey = await this.getParsedValue(tbl_info.tbl_rediskey);
    this.tblFields = await this.getParsedValue(tbl_info.tbl_fields);
    this.tblJoinClause = await this.getParsedValue(tbl_info.tbl_join_clause);
    this.tblWhereClause = await this.getParsedValue(tbl_info.tbl_where_clause);
  }

  async getTableName() {
    if (!this.tblName) await this.setValues();
    return this.tblName;
  }

  async getRedisKey() {
    if (!this.redisKey) await this.setValues();
    return this.redisKey;
  }

  async getTableFields() {
    if (!this.tblFields) await this.setValues();
    return this.tblFields;
  }

  async getTableJoinClause() {
    if (!this.tblJoinClause) await this.setValues();
    return this.tblJoinClause;
  }

  async getTableWhereClause() {
    if (!this.tblWhereClause) await this.setValues();
    return this.tblWhereClause;
  }

  async getParsedValue(sourceValue) {
    if (!sourceValue) {
      console.warn("Missing value:", sourceValue);
      return "";
    }

    if (Array.isArray(sourceValue)) {
      // Format JOIN clauses line-by-line
      return sourceValue.join(sourceValue[0].includes("JOIN") ? "\n" : ", ");
    }

    if (typeof sourceValue === "string" && sourceValue.trim() !== "") {
      return sourceValue.trim();
    }

    console.warn("Unsupported or empty source value:", sourceValue);
    return "";
  }

  async getCleanParamsArray(inputArray) {
    if (!Array.isArray(inputArray)) {
      console.error("Expected an array but got:", inputArray);
      return [];
    }

    return inputArray.map((val) => (val === undefined ? null : val));
  }
}

module.exports = TableInfo;
