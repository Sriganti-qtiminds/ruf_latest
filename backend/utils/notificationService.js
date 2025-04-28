const DatabaseService = require("../utils/service");
const db = require("../config/db");
const TransactionController = require("../utils/transaction");

class NotificationService {
  constructor(io, onlineUsers) {
    this.dbService = new DatabaseService;
    this.io = io;
    this.onlineUsers = onlineUsers;
  }

  async createNotification(User_Id, Notification_Id) {
  try {
    const notificationTemplate = await this.fetchNotification(Notification_Id);
    console.log("notification template", notificationTemplate);

    const fieldNames = "User_Id, Notification_Id, Status";
    const fieldValues = `${db.escape(User_Id)}, ${db.escape(Notification_Id)}, ${db.escape(0)}`;
    const ress = await this.dbService.addNewRecord("dy_notifications", fieldNames, fieldValues);
    console.log("response noti", ress);

    // Create the full notification object to emit
    const newNotification = {
      Id: ress.insertId, // Assuming the DB returns the inserted ID
      User_Id,
      Notification_Id,
      Status: 0,
      CreateTime: new Date().toISOString(),
      Type: notificationTemplate.Type,
      Text: notificationTemplate.Text,
      Frequency: notificationTemplate.Frequency,
      max_counter: notificationTemplate.max_counter,
      receiver: notificationTemplate.receiver,
    };

    console.log("New Notification to Emit:", newNotification); // Debug log

    const targetSocketId = this.onlineUsers.get(User_Id.toString());
    if (targetSocketId) {
      // Emit only the new notification
      this.io.of("/api/notifications").to(User_Id.toString()).emit("receiveNotification", [newNotification]);
      console.log(`Notification sent to user ${User_Id} (socket: ${targetSocketId})`);
    } else {
      console.log(`User ${User_Id} is offline. Notification saved to database.`);
    }

    return newNotification;
  } catch (error) {
    console.error("Error in createNotification:", error.message);
    throw error;
  }
}

async createNotificationForTransaction(id, curr_state_code) {
    try {
        // Map status codes to notifications
        const statusNotificationMap = {
            3: 1,  
            2: 2,   
            7: 3,   
            18: 4,  
            20: 5,  
            31: 6   
        };

        // Get the notification ID based on the status code
        const notificationId = statusNotificationMap[curr_state_code];
        if (!notificationId) {
            console.log("No notification mapped for this status code:", curr_state_code);
            throw new Error("No notification mapped for this status code");
        }

        const transaction = await this.dbService.getRecordsByFields(
            "dy_transactions",
            "user_id",
            `id = ${db.escape(id)}`
        );

        if (!transaction.length) {
            throw new Error("Transaction not found");
        }

        const { user_id } = transaction[0];

        const notificationTemplate = await this.fetchNotification(notificationId);
        console.log("Notification template:", notificationTemplate);

        // Insert notification into database with Status = 0
        const fieldNames = "User_Id, Notification_Id, Status";
        const fieldValues = `${db.escape(user_id)}, ${db.escape(notificationId)}, ${db.escape(0)}`;
        const ress = await this.dbService.addNewRecord("dy_notifications", fieldNames, fieldValues);
        console.log("Database response:", ress);

        // Create the full notification object with database-generated Id and Status = 0
        const newNotification = {
            Id: ress.insertId, // Database-generated ID
            User_Id: user_id,
            Notification_Id: notificationId,
            Status: 0, // Ensure status is 0 for WebSocket
            CreateTime: new Date().toISOString(),
            ...notificationTemplate, // Include notification details
        };

        console.log("New Notification to Emit:", newNotification);

        // Send notification via WebSocket if the user is online
        const targetSocketId = this.onlineUsers.get(user_id.toString());
        if (targetSocketId) {
            this.io.of("/api/notifications")
                .to(user_id.toString())
                .emit("receiveNotification", [newNotification]);
            console.log(`Notification sent to user ${user_id} (socket: ${targetSocketId})`);
        } else {
            console.log(`User ${user_id} is offline. Notification saved to database.`);
        }

        return newNotification;
    } catch (error) {
        console.error("Error in createNotificationForTransaction:", error.message);
        throw error;
    }
}

async createNotificationForProperty(id, curr_state_code) {
  try {
      // Map status codes to notifications
      const statusNotificationMap = {
          3: 1,  
          2: 2,   
          7: 3,   
          18: 4,  
          20: 5,  
          31: 6   
      };

      // Get the notification ID based on the status code
      const notificationId = statusNotificationMap[curr_state_code];
      if (!notificationId) {
          console.log("No notification mapped for this status code:", curr_state_code);
          throw new Error("No notification mapped for this status code");
      }

      const transaction = await this.dbService.getRecordsByFields(
          "dy_property",
          "user_id",
          `id = ${db.escape(id)}`
      );

      if (!transaction.length) {
          throw new Error("Transaction not found");
      }

      const { user_id } = transaction[0];
      
      const notificationTemplate = await this.fetchNotification(notificationId);
      console.log("notification template", notificationTemplate);

      const fieldNames = "User_Id, Notification_Id, Status";
      const fieldValues = `${db.escape(user_id)}, ${db.escape(notificationId)}, ${db.escape(0)}`;
      const ress = await this.dbService.addNewRecord("dy_notifications", fieldNames, fieldValues);
      console.log("response noti", ress);

      // Create the full notification object with database-generated Id and Status
      const newNotification = {
          Id: ress.insertId, // Include the newly generated ID from the database
          User_Id: user_id,
          Notification_Id: notificationId,
          Status: 0, // Set Status as inserted in the database
          CreateTime: new Date().toISOString(),
          ...notificationTemplate, // Spread the template fields (Type, Text, etc.)
      };

      console.log("New Notification to Emit:", newNotification); // Debug log

      const targetSocketId = this.onlineUsers.get(user_id.toString());
      if (targetSocketId) {
          this.io.of("/api/notifications").to(user_id.toString()).emit("receiveNotification", [newNotification]);
          console.log(`Notification sent to user ${user_id} (socket: ${targetSocketId})`);
      } else {
          console.log(`User ${user_id} is offline. Notification saved to database.`);
      }

      return newNotification;
  } catch (error) {
      console.error("Error in createNotificationWithProperty:", error.message);
      throw error;
  }
}



  // Fetch a single notification by ID
  async fetchNotification(notificationId) {
    const notiResults = await this.dbService.getRecordsByFields(
      "st_notifications",
      "*",
      `id = ${db.escape(notificationId)}`
    );
    return notiResults.length > 0 ? notiResults[0] : null;
  }


  // Get all notifications for a user
  async getUserNotifications(User_Id) { 
    try {
        const mainTable = "dy_notifications";
        const joinClauses = "JOIN st_notifications ON dy_notifications.Notification_Id = st_notifications.id";
        const fields = `
            dy_notifications.Id,
            dy_notifications.User_Id,
            dy_notifications.Notification_Id,
            dy_notifications.CreateTime,
            dy_notifications.Status,
            dy_notifications.c_cnt,
            st_notifications.Type,
            st_notifications.Text,
            st_notifications.receiver,
            st_notifications.Frequency,
            st_notifications.max_counter
        `;
        const whereClause = `dy_notifications.User_Id = ${db.escape(User_Id)} ORDER BY dy_notifications.CreateTime DESC`;

        // Fetch joined data using stored procedure
        const notiResults = await this.dbService.getJoinedData(mainTable, joinClauses, fields, whereClause);

        return notiResults;
    } catch (error) {
        console.error("Error fetching user notifications:", error.message);
        throw error;
    }
  }

  // Mark a notification as read
  async markNotificationAsRead(dy_noti_id) {
    try {
        const newStatus = 1; // Status to update (1 for read)
        console.log("Marking notification as read sr", dy_noti_id);
        const ress = await this.dbService.updateRecord(
            "dy_notifications",
            { Status: newStatus },
            `Id = ${dy_noti_id}`
        );
        console.log("ress update", ress);
        return { message: "Notification marked as read" };
    } catch (error) {
        console.error("Error marking notification as read:", error.message);
        throw error;
    }
  }

  // Get all unread notifications for a user
  async getUnreadNotifications(User_Id) {
    try {
        const mainTable = "dy_notifications";
        const joinClauses = "JOIN st_notifications ON dy_notifications.Notification_Id = st_notifications.id";
        const fields = `
            dy_notifications.Id,
            dy_notifications.User_Id,
            dy_notifications.Notification_Id,
            dy_notifications.CreateTime,
            dy_notifications.Status,
            dy_notifications.c_cnt,
            st_notifications.Type,
            st_notifications.Text,
            st_notifications.receiver,
            st_notifications.Frequency,
            st_notifications.max_counter
        `;
        const whereClause = `dy_notifications.User_Id = ${db.escape(User_Id)} AND dy_notifications.Status = ${db.escape(0)}`;

        // Fetch joined data using stored procedure
        const notiResults = await this.dbService.getJoinedData(mainTable, joinClauses, fields, whereClause);

        return notiResults;
    } catch (error) {
        console.error("Error fetching unread notifications:", error.message);
        throw error;
    }
  }

  // Get all read notifications for a user
  async getReadNotifications(User_Id) {
    try {
        const mainTable = "dy_notifications";
        const joinClauses = "JOIN st_notifications ON dy_notifications.Notification_Id = st_notifications.id";
        const fields = `
            dy_notifications.Id,
            dy_notifications.User_Id,
            dy_notifications.Notification_Id,
            dy_notifications.CreateTime,
            dy_notifications.Status,
            dy_notifications.c_cnt,
            st_notifications.Type,
            st_notifications.Text,
            st_notifications.receiver,
            st_notifications.Frequency,
            st_notifications.max_counter
        `;
        const whereClause = `dy_notifications.User_Id = ${db.escape(User_Id)} AND dy_notifications.Status = ${db.escape(1)}`;

        // Fetch joined data using stored procedure
        const notiResults = await this.dbService.getJoinedData(mainTable, joinClauses, fields, whereClause);

        return notiResults;
    } catch (error) {
        console.error("Error fetching read notifications:", error.message);
        throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(User_Id) {
    try {
        const newStatus = 1; // Status to update (1 for read)
        const whereClause = `User_Id = ${db.escape(User_Id)} AND Status = ${db.escape(0)}`;

        // Update all unread notifications to read
        const result = await this.dbService.updateRecord(
            "dy_notifications",
            { Status: newStatus },
            whereClause
        );

        return { message: "All notifications marked as read" };
    } catch (error) {
        console.error("Error marking all notifications as read:", error.message);
        throw error;
    }
  }

  // Mark a specific notification as unread
  async markNotificationAsUnread(dy_noti_id) {
    try {
        const newStatus = 0; // Status to update (0 for unread)
        const whereClause = `Id = ${db.escape(dy_noti_id)}`;

        // Update the notification status to unread
        const result = await this.dbService.updateRecord(
            "dy_notifications",
            { Status: newStatus },
            whereClause
        );

        return { message: "Notification marked as unread" };
    } catch (error) {
        console.error("Error marking notification as unread:", error.message);
        throw error;
    }
  }

  // Delete a notification
  async deleteNotification(dy_noti_id) {
    try {
        const whereClause = `Id = ${db.escape(dy_noti_id)}`;

        // Delete the notification
        const result = await this.dbService.deleteRecord(
            "dy_notifications",
            whereClause
        );

        return { message: "Notification deleted successfully" };
    } catch (error) {
        console.error("Error deleting notification:", error.message);
        throw error;
    }
  }

  // Get the count of unread notifications for a user
  async getUnreadNotificationCount(User_Id) {
    try {
        const whereClause = `User_Id = ${db.escape(User_Id)} AND Status = ${db.escape(0)}`;

        // Get the count of unread notifications
        const count = await this.dbService.getAggregateValue(
            "dy_notifications",
            "*",
            "count",
            whereClause
        );

        return count;
    } catch (error) {
        console.error("Error fetching unread notification count:", error.message);
        throw error;
    }
  }
}

module.exports = NotificationService;