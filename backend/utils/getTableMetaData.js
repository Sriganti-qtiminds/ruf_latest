const TableInfo = require("./tblInfo"); // adjust path if needed

async function getTableMetaData(jsonfilename) {
  const tblInfoObj = new TableInfo();
  const jsonLoaded = await tblInfoObj.getJsonData(jsonfilename);
  if (!jsonLoaded) {
    throw new Error("Invalid or missing JSON metadata.");
  }

  await tblInfoObj.setValues();

  const tableName = await tblInfoObj.getTableName();
  const tableFields = (await tblInfoObj.getTableFields()) || "*";
  const joinClause = await tblInfoObj.getTableJoinClause();
  const whereClause = await tblInfoObj.getTableWhereClause();
  const redisKey = await tblInfoObj.getRedisKey();

  return { tableName, tableFields, joinClause, whereClause, redisKey };
}

module.exports = getTableMetaData;
