const DatabaseService = require("../utils/service"); // Correct import path
const db = require("../config/db"); // Database connection object
const { propertyFields, fieldNames1 } = require("../utils/joins");
require("dotenv").config();
const BaseController = require("../utils/baseClass");
const S3Service = require("../utils/s3");
const moment = require("moment");
const  TransactionController=require("../utils/transaction")

class addRmTask extends BaseController {
  async addRmTask(req, res) {
    const { user_id, property_id, cur_stat_code ,community_id} = req.body;
  
    if (!user_id) {
      return res
        .status(400)
        .json({ error: "user_id is required." });
    }
    let connection;

    try {
            connection = await TransactionController.getConnection();
            await TransactionController.beginTransaction(connection);
      
      // Check if the record already exists
      const existingRecord = await this.dbService.getRecordsByFields(
        "dy_transactions",
        "*",
        `user_id = ${db.escape(user_id)} and prop_id= ${db.escape(property_id)}`
      );
  
      if (existingRecord.length > 0) {
        return res.status(200).json({
          message: "Transaction already assigned.",
        });
      }
  
      // Insert new record
      const insertFields = "user_id, prop_id, cur_stat_code,community_id";
      const insertValues = `${db.escape(user_id)}, ${db.escape(property_id)}, ${cur_stat_code || 3}, ${db.escape(community_id)}`;
  
      await this.dbService.addNewRecord(
        "dy_transactions",
        insertFields,
        insertValues,
        connection
      );
            await TransactionController.commitTransaction(connection);
      
  
      res.status(200).json({
        message: "Transaction assigned successfully.",
      });
    } catch (error) {
      console.error("Error assigning RM to transaction:", error.message);
            if (connection) {
              await TransactionController.rollbackTransaction(connection, error.message);
            }
      
      res.status(500).json({
        error: "An error occurred while assigning the transaction.",
        details: error.message,
      });
    }
    finally {
          if (connection) {
            await TransactionController.releaseConnection(connection);
          }
        }
  }
}

class TaskController extends BaseController {
async getTasks(req, res) {
  try {
    const { rm_id, fm_id, community_id } = req.query;

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
      c.id AS community_id,
      c.name AS community_name,
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
      dt.tr_st_time AS rec_st_time,
      dt.cur_stat_code AS curr_stat_code_id,  -- still return alias
      cs.status_code AS curr_stat_code,
      dt.schedule_date AS schedule_date,
      dt.schedule_time AS schedule_time,
      rm_map.rm_id AS rm_id,
      rm_user.user_name AS rm_name,
      rm_map.fm_id AS fm_id,
      fm_user.user_name AS fm_name
    `;

    // ✅ Use actual column name for filtering
    const conditions = ["dt.cur_stat_code <> 30"];
    if (rm_id) conditions.push(`rm_map.rm_id = ${db.escape(rm_id)}`);
    if (fm_id) conditions.push(`rm_map.fm_id = ${db.escape(fm_id)}`);
    if (community_id) conditions.push(`c.id = ${db.escape(community_id)}`);

    const whereCondition = conditions.join(" AND ");

    const taskResults = await this.dbService.getJoinedData(
      mainTable,
      joinClauses,
      fields,
      whereCondition
    );

    const statusCondition =
      rm_id
        ? 'status_category="RMA" OR status_category="FMA"'
        : fm_id
        ? 'status_category="FMA"'
        : "1 = 1";

    const statusResults = await this.dbService.getRecordsByFields(
      "st_current_status",
      "id, status_code",
      statusCondition
    );

    let associatedProperties = [];
    if (rm_id) {
      const communityResults = await this.dbService.getRecordsByFields(
        "dy_rm_fm_com_map",
        "community_id",
        `rm_id = ${db.escape(rm_id)}`
      );

      const communityIds = communityResults.map(row => row.community_id);

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
        const propertyCondition = `
          dy.community_id IN (${communityIds.join(", ")})
          AND (dt.cur_stat_code IS NULL OR dt.cur_stat_code <> 30)
        `;

        associatedProperties = await this.dbService.getJoinedData(
          propertyTable,
          propertyJoinClauses,
          propertyFields,
          propertyCondition
        );
      }
    }

    res.status(200).json({
      message: "Data retrieved successfully.",
      result: taskResults,
      status: statusResults,
      associatedProperties,
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


class updateTask extends BaseController {
 
    async updateTask(req, res) {
      const {
        id,
        cur_stat_code,
        schedule_time,
        schedule_date,
        rm_id,
        fm_id,
        Inv_Amount,
        Inv_CGST = 0,
        Inv_SGST = 0,
      } = req.body;
    
      // Validate input (optional, added for consistency with addAmenities)
      if (!id || !cur_stat_code) {
        return res.status(400).json({
          error: "Invalid input. Provide a valid transaction ID and status code.",
        });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        // Step 2: Fetch current transaction data
        const transactionTable = "dy_transactions";
        const transactionWhereCondition = `id = ${db.escape(id)}`;
        const transactionRecord = await this.dbService.getRecordsByFields(
          transactionTable,
          "cur_stat_code, prop_id, tr_upd_time, user_id AS tenant_id",
          transactionWhereCondition,
          connection // Use transaction connection
        );
    
        if (!transactionRecord.length) {
          await TransactionController.rollbackTransaction(
            connection,
            "Transaction not found; transaction rolled back."
          );
          return res.status(404).json({ message: "Transaction not found" });
        }
    
        const {
          cur_stat_code: prev_stat_code,
          prop_id,
          tr_upd_time,
          tenant_id,
        } = transactionRecord[0];
    
        // Step 3: Prepare update fields for dy_transactions
        const fieldValuePairs = {};
        if (cur_stat_code) {
          fieldValuePairs.prev_stat_code = prev_stat_code;
          fieldValuePairs.cur_stat_code = cur_stat_code;
        }
        if (schedule_time) fieldValuePairs.schedule_time = schedule_time;
        if (schedule_date) fieldValuePairs.schedule_date = schedule_date;
        if (rm_id) fieldValuePairs.rm_id = rm_id;
        if (fm_id) fieldValuePairs.fm_id = fm_id;
    
        // Step 4: Update dy_transactions
        await this.dbService.updateRecord(
          transactionTable,
          fieldValuePairs,
          transactionWhereCondition,
          connection // Use transaction connection
        );
    
        // Step 5: Handle invoice creation if cur_stat_code is 18
        if (cur_stat_code == 18) {
          console.log("cur_stat_code is 18, processing invoice...");
    
          if (!tenant_id || !prop_id || !tr_upd_time) {
            await TransactionController.rollbackTransaction(
              connection,
              "Missing required transaction data for invoice creation."
            );
            return res.status(400).json({
              error: "Missing required transaction data for invoice creation.",
            });
          }
    
          // Check if an invoice already exists
          const invoiceTable = "dy_invoice";
          const invoiceWhereCondition = `Tenant_ID = ${db.escape(tenant_id)} AND Property_ID = ${db.escape(prop_id)}`;
          const existingInvoice = await this.dbService.getRecordsByFields(
            invoiceTable,
            "id",
            invoiceWhereCondition,
            connection // Use transaction connection
          );
    
          if (existingInvoice.length) {
            console.log(
              `Invoice already exists for Tenant_ID: ${tenant_id} and Property_ID: ${prop_id}`
            );
            await TransactionController.rollbackTransaction(
              connection,
              "Invoice already exists; transaction rolled back."
            );
            return res.status(400).json({
              message: "Invoice already exists for this Tenant and Property.",
            });
          }
    
          // Generate new Inv_Id
          const now = new Date(tr_upd_time);
          const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
          const latestInvoiceWhereCondition = `Inv_Id LIKE 'RRI-${yearMonth}-%' ORDER BY CAST(SUBSTRING_INDEX(Inv_Id, '-', -1) AS UNSIGNED) DESC LIMIT 1`;
          const latestInvoice = await this.dbService.getRecordsByFields(
            invoiceTable,
            "Inv_Id",
            latestInvoiceWhereCondition,
            connection // Use transaction connection
          );
    
          let nextSequence = 1;
          if (latestInvoice.length) {
            const lastInvId = latestInvoice[0].Inv_Id;
            const lastSequence = parseInt(lastInvId.split("-").pop(), 10) || 0;
            nextSequence = lastSequence + 1;
          }
    
          const Inv_Id = `RRI-${yearMonth}-${nextSequence}`;
          console.log(`Generated Inv_Id: ${Inv_Id}`);
    
          const halfInvAmount = Inv_Amount / 2;
          const halfInvTotal = halfInvAmount;
    
          // Fetch service details
          const serviceTable = "st_services";
          const servicedetails = await this.dbService.getRecordsByFields(
            serviceTable,
            "id, service_name",
            null, // No WHERE condition
            connection // Use transaction connection
          );
    
          const serviceDetailsStr = JSON.stringify(servicedetails).replace(/'/g, "''");
    
          // Insert invoice into dy_invoice
          const invoiceFieldNames = "Inv_Id, Tenant_ID, Property_ID, Inv_Amount, Inv_CGST, Inv_SGST, Inv_Total, Inv_DateTime, Inv_DueDate, package_id, service_ids";
          const invoiceFieldValues = `'${Inv_Id}', '${tenant_id}', ${prop_id}, ${halfInvAmount}, ${Inv_CGST}, ${Inv_SGST}, ${halfInvTotal}, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 1, '${serviceDetailsStr}'`;
          await this.dbService.addNewRecord(
            invoiceTable,
            invoiceFieldNames,
            invoiceFieldValues,
            connection // Use transaction connection
          );
    
          console.log(`New invoice added with Inv_Id: ${Inv_Id}`);
    
          // Step 6: Commit the transaction before external operations
          await TransactionController.commitTransaction(connection);
    
          // S3 upload and final data fetch (outside transaction)
          const s3Key = `users/${tenant_id}/invoices/${Inv_Id}_${prop_id}.json`;
          const invoiceData = await this.dbService.getJoinedData(
            "dy_invoice di",
            `LEFT JOIN dy_property dp ON di.Property_ID = dp.id
             LEFT JOIN st_community sc ON dp.community_id = sc.id
             LEFT JOIN dy_user u ON di.Tenant_ID = u.id
             LEFT JOIN dy_user owner ON dp.user_id = owner.id
             LEFT JOIN st_packages sp ON di.package_id = sp.id`,
            `di.id AS Invoice_Record_ID, 
             u.id AS tenant_id, 
             u.user_name AS tenant_name, 
             u.email_id AS tenant_email, 
             u.mobile_no AS tenant_mobile,
             u.customer_id AS customer_id,
             dp.id AS property_id, 
             dp.user_id AS owner_id, 
             dp.community_id,
             dp.tower_no AS property_tower,
             dp.flat_no AS property_flat,
             dp.floor_no AS property_floor,
             di.package_id,
             di.service_ids as services,
             sp.package_desc,
             CONCAT(
               CASE WHEN dp.flat_no IS NOT NULL THEN CONCAT('Flat No: ', dp.flat_no, ', ') ELSE '' END,
               CASE WHEN dp.floor_no IS NOT NULL THEN CONCAT('Floor: ', dp.floor_no, ', ') ELSE '' END,
               CASE WHEN dp.tower_no IS NOT NULL THEN CONCAT('Tower: ', dp.tower_no, ', ') ELSE '' END,
               sc.address
             ) AS address,
             di.Inv_Id, 
             di.Inv_Amount, 
             di.Inv_CGST, 
             di.Inv_SGST, 
             di.Inv_Total, 
             di.Inv_DateTime, 
             di.Inv_DueDate,
             owner.user_name AS owner_name, 
             owner.mobile_no AS owner_mobile,
             owner.email_id AS owner_email`,
            `di.Inv_Id = '${Inv_Id}'`
          );
    
          if (!invoiceData.length) {
            console.error("Error: Invoice not found after insertion.");
            return res.status(500).json({ error: "Invoice not found after insertion." });
          }
    
          await S3Service.uploadJsonToS3(
            s3Key,
            JSON.stringify(invoiceData[0], null, 2)
          );
    
          // Respond with success
          res.status(200).json({
            message: "Task updated successfully.",
            invoiceData: invoiceData[0],
            s3Location: s3Key,
          });
        } else {
          // Step 6: Commit the transaction for non-invoice case
          await TransactionController.commitTransaction(connection);
    
          // Respond with success
          res.status(200).json({
            message: "Task updated successfully.",
          });
        }
      } catch (error) {
        console.error("Error updating task:", error.message);
    
        // Step 7: Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, error.message);
        }
    
        // Respond with error
        res.status(500).json({
          error: "An error occurred while updating task.",
          details: error.message,
        });
      } finally {
        // Step 8: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }
  


    async updateRMTask(req, res) {
      const { user_id, property_id, cur_stat_code } = req.body;
    
      // Validate input
      if (!user_id || !property_id || !cur_stat_code) {
        return res.status(400).json({
          error: "Invalid input. Provide valid user ID, property ID, and status code.",
        });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        const tableName = "dy_transactions";
    
        // Step 2: Perform the update
        const fieldValuePairs = {
          user_id: user_id,
          prop_id: property_id,
          cur_stat_code: cur_stat_code,
        };
        const whereCondition = `user_id = ${db.escape(user_id)} AND prop_id = ${db.escape(property_id)}`;
        await this.dbService.updateRecord(tableName, fieldValuePairs, whereCondition, connection);
    
        // Step 3: Commit the transaction
        await TransactionController.commitTransaction(connection);
    
        // Respond with success
        res.status(200).json({
          message: "Transaction updated successfully.",
        });
      } catch (error) {
        console.error("Error updating transaction:", error.message);
    
        // Step 4: Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, error.message);
        }
    
        // Respond with error
        res.status(500).json({
          error: "An error occurred while updating the transaction.",
          details: error.message,
        });
      } finally {
        // Step 5: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }
}

module.exports = { addRmTask, TaskController, updateTask }; // Export the controller classes for use in the routes
