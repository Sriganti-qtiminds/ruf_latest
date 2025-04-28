const db = require("../config/db");
const dotenv = require("dotenv");
const DatabaseService = require("../utils/service");
const BaseController = require("../utils/baseClass");
const { Validator } = require("node-input-validator");
const  TransactionController=require("../utils/transaction")

dotenv.config();

class AuthController extends BaseController {
  async fetchRoleName(roleId) {
    const roleResults = await this.dbService.getRecordsByFields(
      "st_role",
      "role",
      `id = ${db.escape(roleId)}`
    );
    return roleResults.length > 0 ? roleResults[0].role : null;
  }

  validateFields(fields, requiredFields) {
    const missingFields = requiredFields.filter((field) => !fields[field]);
    return missingFields.length > 0
      ? `Missing required fields: ${missingFields.join(", ")}`
      : null;
  }

  
    async signup(req, res) {
      const { uid, email, displayName, mobile_no, role_id, token, referredBy } =
        req.body;
    
      // Validate input
      const validationError = this.validateFields(req.body, [
        "uid",
        "email",
        "role_id",
        "token",
      ]);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        let isPropertyLinked = false;
    
        // Step 2: Check if the user already exists
        const existingUser = await this.dbService.getRecordsByFields(
          "dy_user",
          "*",
          `email_id = ${db.escape(email)}`
        );
    
        let isUidInt =
          existingUser.length > 0
            ? Number.isInteger(Number(existingUser[0].id))
            : 0; // Check if UID is an integer
        let ex_id = isUidInt ? existingUser[0].id : 0;
    
        if (existingUser.length > 0 && !isUidInt) {
          await TransactionController.rollbackTransaction(
            connection,
            "User already exists; transaction rolled back."
          );
          return res
            .status(409)
            .json({ message: "User already exists. Please login." });
        }
    
        // Step 3: Validate the role ID
        const roleName = await this.fetchRoleName(role_id);
        if (!roleName) {
          await TransactionController.rollbackTransaction(
            connection,
            "Invalid role_id; transaction rolled back."
          );
          return res.status(400).json({ message: "Invalid role_id. Role not found." });
        }
    
        // Step 4: Generate a unique referral code
        const generateReferralCode = () => {
          return Math.random().toString(36).substring(2, 10);
        };
    
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
          referralCode = generateReferralCode();
          const existingCode = await this.dbService.getRecordsByFields(
            "dy_user",
            "ref_code",
            `ref_code = ${db.escape(referralCode)}`
          );
          isUnique = existingCode.length === 0;
        }
    
        const customerId = Math.floor(Date.now() / 1000); // Get epoch time
    
        // Step 5: Insert the new user
        const fieldNames =
          "id, user_name, email_id, mobile_no, role_id, ref_code, customer_id";
        const fieldValues = `${db.escape(uid)}, ${db.escape(
          displayName || null
        )}, ${db.escape(email)}, ${db.escape(mobile_no || null)}, ${db.escape(
          role_id
        )}, ${db.escape(referralCode)}, ${db.escape(customerId)}`;
    
        await this.dbService.addNewRecord(
          "dy_user",
          fieldNames,
          fieldValues,
          connection
        );
    
        // Add user_id to dy_user_profile table
        await this.dbService.addNewRecord(
          "dy_user_profile",
          "user_id",
          `${db.escape(uid)}`,
          connection
        );
    
        // Step 6: Check if the UID is linked to a property
        if (isUidInt) {
          const propertyRecords = await this.dbService.getRecordsByFields(
            "dy_property",
            "COUNT(*) as count",
            `user_id = ${db.escape(ex_id)}`
          );
          isPropertyLinked =
            propertyRecords.length > 0 && propertyRecords[0].count > 0;
        }
    
        if (isUidInt && isPropertyLinked) {
          await this.dbService.updateRecord(
            "dy_property",
            { user_id: uid },
            `user_id = ${db.escape(ex_id)}`,
            connection
          );
        }
    
        // Step 7: Add referral history if provided
        if (referredBy) {
          await this.addReferralHistory(uid, referredBy, connection);
        }
    
        // Step 8: Commit the transaction
        await TransactionController.commitTransaction(connection);
    
        // Respond with success
        res.status(201).json({
          message: "User registered successfully.",
          token,
          id: uid,
          role: roleName,
          email,
          username: displayName || null,
        });
      } catch (err) {
        console.error("Error during signup:", err.message);
    
        // Step 9: Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, err.message);
        }
    
        // Respond with error
        res.status(500).json({ message: "Internal server error." });
      } finally {
        // Step 10: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }


    async referral(req, res) {
      const { referredBy } = req.body;
    
      // Validate input
      const v = new Validator(req.body, {
        referredBy: "required|minLength:8|maxLength:8",
      });
    
      const matched = await v.check();
      if (!matched) {
        return res.status(400).json({ message: v.errors });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        // Step 2: Validate the referral code with case-sensitive check
        const referredByData = await this.dbService.getRecordsByFields(
          "dy_user",
          "ref_code, id",
          `BINARY ref_code = ${db.escape(referredBy)}`,
          connection
        );
    
        if (!referredByData.length) {
          // Rollback transaction if referral code is invalid
          await TransactionController.rollbackTransaction(
            connection,
            "Invalid referral code; transaction rolled back."
          );
          return res.status(400).json({ message: "Invalid referral code." });
        }
    
        // Step 3: Commit the transaction
        await TransactionController.commitTransaction(connection);
    
        // Respond with success
        return res.status(200).json({ message: "Referral code is valid." });
      } catch (error) {
        console.error("Error during referral validation:", error.message);
    
        // Step 4: Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, error.message);
        }
    
        // Respond with error
        res.status(500).json({
          message: "An error occurred during referral validation.",
          details: error.message,
        });
      } finally {
        // Step 5: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }

  async addReferralHistory(userId, referredBy) {
    try {
      const referredByData = await this.dbService.getRecordsByFields(
        "dy_user",
        "id",
        `ref_code = ${db.escape(referredBy)}`
      );

      if (!referredByData[0]) {
        throw new Error("Invalid referral code.");
      }

      const reffId = referredByData[0].id;

      // Check if referral history already exists
      const existingReferral = await this.dbService.getRecordsByFields(
        "dy_refferal_history",
        "*",
        `user_id = ${db.escape(userId)} AND refferral_id = ${db.escape(reffId)}`
      );

      if (existingReferral.length > 0) {
        throw new Error("Referral history already exists.");
      }

      // Add referral history
      const allFilds = "user_id, refferral_id";
      const allFieldValue = `${db.escape(userId)}, ${db.escape(reffId)}`;
      await this.dbService.addNewRecord(
        "dy_refferal_history",
        allFilds,
        allFieldValue
      );

      return true;
    } catch (error) {
      console.error("Error adding referral history:", error.message);
      throw error;
    }
  }


    async checkMobile(req, res) {
      const { mobile_no } = req.body;
    
      // Validate input (ensure it's between 10 to 15 digits)
      const v = new Validator(req.body, {
        mobile_no: "required|minLength:10|maxLength:15",
      });
    
      const isValid = await v.check();
      if (!isValid) {
        return res.status(400).json({ message: v.errors });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        // Convert to string and extract the last 10 digits
        const last10Digits = String(mobile_no).slice(-10);
    
        // Check if a number with the same last 10 digits exists in the database
        const queryCondition = `RIGHT(mobile_no, 10) = ${db.escape(last10Digits)}`;
        const existingUser = await this.dbService.getRecordsByFields(
          "dy_user",
          "mobile_no, id",
          queryCondition,
          connection
        );
    
        if (existingUser.length > 0) {
          const userId = existingUser[0].id;
    
          // If `id` is an integer, allow signup
          if (Number.isInteger(userId)) {
            await TransactionController.commitTransaction(connection);
            return res.status(200).json({
              message: "Mobile number exists but can be used for signup.",
            });
          }
    
          // Rollback the transaction if mobile number is already used
          await TransactionController.rollbackTransaction(
            connection,
            "Mobile number already exists."
          );
          return res.status(400).json({
            message: "Mobile number already exists. Please use a different number.",
          });
        }
    
        // Commit transaction for a valid mobile number
        await TransactionController.commitTransaction(connection);
        return res.status(200).json({ message: "Valid mobile number." });
      } catch (error) {
        console.error("Error checking mobile number:", error.message);
    
        // Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, error.message);
        }
    
        return res.status(500).json({
          error: "An error occurred while checking the mobile number.",
          details: error.message,
        });
      } finally {
        // Step 6: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }


    async g_login(req, res) {
      const { uid, email, displayName, mobile_no, token, role_id, referredBy } = req.body;
    
      // Validate input
      if (!uid || !email || !token) {
        return res.status(400).json({ message: "Required fields are missing." });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        let isPropertyLinked = false;
    
        // Check if the user exists in the database
        const existingUser = await this.dbService.getRecordsByFields(
          "dy_user",
          "*",
          `email_id = ${db.escape(email)}`
        );
    
        let isUidInt =
          existingUser.length > 0
            ? Number.isInteger(Number(existingUser[0].id))
            : 0; // Check if UID is an integer
        let ex_id = isUidInt ? existingUser[0].id : 0;
    
        if (existingUser.length > 0 && !isUidInt) {
          const user = existingUser[0];
          const assignedRoleId = user.role_id;
    
          // Fetch role name
          const roleResults = await this.dbService.getRecordsByFields(
            "st_role",
            "role",
            `id = ${db.escape(assignedRoleId)}`
          );
          const roleName = roleResults.length > 0 ? roleResults[0].role : null;
    
          if (!roleName) {
            throw new Error("Invalid role_id. Role not found.");
          }
    
          // Commit transaction before returning
          await TransactionController.commitTransaction(connection);
    
          return res.status(200).json({
            message: "Login successful.",
            token,
            id: uid,
            role: roleName,
            email: user.email_id,
            isMobile: !!user.mobile_no,
            username: user.user_name,
          });
        }
    
        // If user does not exist, create a new user
        const assignedRoleId = role_id || 2;
    
        // Fetch role name for the new user
        const roleResults = await this.dbService.getRecordsByFields(
          "st_role",
          "role",
          `id = ${db.escape(assignedRoleId)}`
        );
        const roleName = roleResults.length > 0 ? roleResults[0].role : null;
    
        if (!roleName) {
          throw new Error("Invalid role_id. Role not found.");
        }
    
        // Generate unique referral code
        const generateReferralCode = () => Math.random().toString(36).substring(2, 10);
        let referralCode;
        let isUnique = false;
    
        while (!isUnique) {
          referralCode = generateReferralCode();
          const existingCode = await this.dbService.getRecordsByFields(
            "dy_user",
            "ref_code",
            `ref_code = ${db.escape(referralCode)}`
          );
          isUnique = existingCode.length === 0;
        }
    
        const customerId = Math.floor(Date.now() / 1000);
    
        // Add new user to database
        const fieldNames =
          "id, user_name, email_id, mobile_no, role_id, ref_code, customer_id";
        const fieldValues = `${db.escape(uid)}, ${db.escape(
          displayName || null
        )}, ${db.escape(email)}, ${db.escape(mobile_no || null)}, ${db.escape(
          role_id
        )}, ${db.escape(referralCode)}, ${db.escape(customerId)}`;
        await this.dbService.addNewRecord("dy_user", fieldNames, fieldValues, connection);
    
        await this.dbService.addNewRecord(
          "dy_user_profile",
          "user_id",
          `${db.escape(uid)}`,
          connection
        );
    
        if (isUidInt) {
          const propertyRecords = await this.dbService.getRecordsByFields(
            "dy_property",
            "COUNT(*) as count",
            `user_id = ${db.escape(ex_id)}`
          );
          isPropertyLinked = propertyRecords.length > 0 && propertyRecords[0].count > 0;
    
          if (isPropertyLinked) {
            await this.dbService.updateRecord(
              "dy_property",
              { user_id: uid },
              `user_id = ${db.escape(ex_id)}`,
              connection
            );
          }
        }
    
        if (referredBy) {
          await this.addReferralHistory(uid, referredBy, connection);
        }
    
        // Commit the transaction
        await TransactionController.commitTransaction(connection);
    
        return res.status(201).json({
          message: "User registered and logged in successfully.",
          token,
          id: uid,
          role: roleName,
          email,
          isMobile: !!mobile_no,
          username: displayName || null,
        });
      } catch (error) {
        console.error("Error during Google login:", error.message);
    
        // Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, error.message);
        }
    
        return res.status(500).json({
          error: "An error occurred during Google login.",
          details: error.message,
        });
      } finally {
        // Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }


    async addMobileNumber(req, res) {
      const { id, mobile_no } = req.body;
    
      // Validate input
      if (!id || !mobile_no) {
        return res
          .status(400)
          .json({ message: "User ID and Mobile Number are required." });
      }
    
      if (!/^\+?\d{10,15}$/.test(mobile_no)) {
        return res.status(400).json({
          message: "Mobile number must be 10-15 digits and may start with '+'. ",
        });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        // Step 2: Check if user exists
        const existingUser = await this.dbService.getRecordsByFields(
          "dy_user",
          "*",
          `id = ${db.escape(id)}`
        );
    
        if (existingUser.length === 0) {
          await TransactionController.rollbackTransaction(
            connection,
            "User not found; transaction rolled back."
          );
          return res.status(404).json({ message: "User not found." });
        }
    
        // Step 3: Update mobile number in the database
        await this.dbService.updateRecord(
          "dy_user",
          { mobile_no: mobile_no },
          `id = ${db.escape(id)}`,
          connection
        );
    
        // Step 4: Commit the transaction
        await TransactionController.commitTransaction(connection);
    
        // Respond with success
        res.status(200).json({ message: "Mobile number added successfully." });
      } catch (error) {
        console.error("Error adding mobile number:", error.message);
    
        // Step 5: Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, error.message);
        }
    
        // Respond with error
        res.status(500).json({
          error: "An error occurred while adding the mobile number.",
          details: error.message,
        });
      } finally {
        // Step 6: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }


    async login(req, res) {
      const { uid, token } = req.body;
    
      // Validate input
      if (!uid) {
        return res.status(400).json({ message: "UID is required." });
      }
    
      let connection;
    
      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);
    
        // Step 2: Fetch user details from the database
        const existingUser = await this.dbService.getRecordsByFields(
          "dy_user",
          "*",
          `id = ${db.escape(uid)}`,
          connection
        );
    
        if (existingUser.length === 0) {
          await TransactionController.rollbackTransaction(connection, "User not found.");
          return res.status(404).json({ message: "User not found. Please signup first." });
        }
    
        const user = existingUser[0];
    
        // Step 3: Fetch role name
        const roleName = await this.fetchRoleName(user.role_id, connection);
        if (!roleName) {
          await TransactionController.rollbackTransaction(connection, "Invalid role_id.");
          return res.status(400).json({ message: "Invalid role_id. Role not found." });
        }
    
        // Step 4: Commit transaction
        await TransactionController.commitTransaction(connection);
    
        // Respond with success
        res.status(200).json({
          message: "Login successful.",
          email: user.email_id,
          id: uid,
          token,
          isMobile: user.mobile_no ? true : false,
          role: roleName,
          username: user.user_name,
        });
      } catch (error) {
        console.error("Error during login:", error.message);
    
        // Step 5: Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(connection, error.message);
        }
    
        // Respond with error
        res.status(500).json({
          error: "An error occurred during login.",
          details: error.message,
        });
      } finally {
        // Step 6: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    }
}
module.exports = AuthController;
