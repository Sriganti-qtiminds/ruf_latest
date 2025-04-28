const NotificationService = require("../utils/notificationService");
const  TransactionController=require("../utils/transaction")

class NotificationController {
  constructor(io, onlineUsers) {
    this.notificationService = new NotificationService(io, onlineUsers);
  }

  // Helper function to validate request body
  validateRequestBody(requiredFields, body, res) {
    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(", ")}` 
      });
    }
    return null;
  }

  // Create "Connect to Manager" notification
  async create_notification(req, res) {
    const validationError = this.validateRequestBody(["userId", "notificationId"], req.body, res);
    if (validationError) return;

    try {
      const { userId, notificationId } = req.body;
      const notification = await this.notificationService.createNotification(userId, notificationId);
      res.status(201).json({ message: "Request sent successfully", notification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to connect to manager" });
    }
  }

  // Create notification with property
  async create_notification_for_transaction(req, res) {
    const validationError = this.validateRequestBody(["id", "cur_stat_code"], req.body, res);
    if (validationError) return;

    try {
      const { id, cur_stat_code } = req.body;
      const notification = await this.notificationService.createNotificationForTransaction(id, cur_stat_code);
      res.status(201).json({ message: "Request sent successfully", notification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send notification or notification not found for that status code" });
    }
  }
  async create_notification_for_property(req, res) {
    const validationError = this.validateRequestBody(["id", "cur_stat_code"], req.body, res);
    if (validationError) return;

    try {
      const { id, cur_stat_code } = req.body;
      const notification = await this.notificationService.createNotificationForProperty(id, cur_stat_code);
      res.status(201).json({ message: "Request sent successfully", notification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send notification or notification not found for that status code" });
    }
  }

  // Get all notifications for a user
  async getNotificationsByTarget(req, res) {
    if (!req.params.User_Id) {
      return res.status(400).json({ message: "User_Id is required" });
    }

    try {
      const { User_Id } = req.params;
      const notifications = await this.notificationService.getUserNotifications(User_Id);
      res.status(200).json({ message: "Data found successfully", "No. of Records": notifications.length, notifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }

  // Mark a notification as read
  async markNotificationAsRead(req, res) {
    const validationError = this.validateRequestBody(["dy_noti_id"], req.body, res);
    if (validationError) return;

    try {
      const { dy_noti_id } = req.body;
      const result = await this.notificationService.markNotificationAsRead(dy_noti_id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }

  // Get unread notifications for a user
  async getUnreadNotifications(req, res) {
    if (!req.params.User_Id) {
      return res.status(400).json({ message: "User_Id is required" });
    }

    try {
      const { User_Id } = req.params;
      const notifications = await this.notificationService.getUnreadNotifications(User_Id);
      res.status(200).json({ message: "Data found successfully", "No. of Records": notifications.length, notifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  }

  // Get read notifications for a user
  async getReadNotifications(req, res) {
    if (!req.params.User_Id) {
      return res.status(400).json({ message: "User_Id is required" });
    }

    try {
      const { User_Id } = req.params;
      const notifications = await this.notificationService.getReadNotifications(User_Id);
      res.status(200).json({ message: "Data found successfully", "No. of Records": notifications.length, notifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch read notifications" });
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(req, res) {
    const validationError = this.validateRequestBody(["userId"], req.body, res);
    if (validationError) return;

    try {
      const { userId } = req.body;
      const result = await this.notificationService.markAllNotificationsAsRead(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  }

  // Mark a specific notification as unread
  async markNotificationAsUnread(req, res) {
    const validationError = this.validateRequestBody(["dy_noti_id"], req.body, res);
    if (validationError) return;

    try {
      const { dy_noti_id } = req.body;
      const result = await this.notificationService.markNotificationAsUnread(dy_noti_id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to mark notification as unread" });
    }
  }

  // Delete a notification
  async deleteNotification(req, res) {
    const validationError = this.validateRequestBody(["dy_noti_id"], req.body, res);
    if (validationError) return;

    try {
      const { dy_noti_id } = req.body;
      const result = await this.notificationService.deleteNotification(dy_noti_id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  }

  // Get the count of unread notifications for a user
  async getUnreadNotificationCount(req, res) {
    if (!req.params.User_Id) {
      return res.status(400).json({ message: "User_Id is required" });
    }

    try {
      const { User_Id } = req.params;
      const count = await this.notificationService.getUnreadNotificationCount(User_Id);
      res.status(200).json({ count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  }
}

module.exports = NotificationController;
