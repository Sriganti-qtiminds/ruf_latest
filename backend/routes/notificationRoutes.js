const express = require('express');
const NotificationController = require('../controllers/notificationController');

const router = express.Router();

module.exports = (io, onlineUsers) => {
  const notificationController = new NotificationController(io, onlineUsers);

  // Route for creating a notification
  router.post('/create', (req, res) => notificationController.create_notification(req, res));
  router.post('/create_tran', (req, res) => notificationController.create_notification_for_transaction(req, res));
  router.post('/create_prop', (req, res) => notificationController.create_notification_for_property(req, res));

  // Route for getting all notifications for a user
  router.get('/all/:User_Id', (req, res) => notificationController.getNotificationsByTarget(req, res));

  // Route for marking a notification as read
  router.patch('/m_read', (req, res) => notificationController.markNotificationAsRead(req, res));

  // Route for getting unread notifications for a user
  router.get('/unread/:User_Id', (req, res) => notificationController.getUnreadNotifications(req, res));

  // Route for getting read notifications for a user
  router.get('/read/:User_Id', (req, res) => notificationController.getReadNotifications(req, res));

  // Route for marking all notifications as read
  router.patch('/markAllRead', (req, res) => notificationController.markAllNotificationsAsRead(req, res));

  // Route for marking a notification as unread
  router.patch('/markUnread', (req, res) => notificationController.markNotificationAsUnread(req, res));

  // Route for deleting a notification
  router.delete('/delete', (req, res) => notificationController.deleteNotification(req, res));

  // Route for getting the count of unread notifications for a user
  router.get('/unread/count/:User_Id', (req, res) => notificationController.getUnreadNotificationCount(req, res));

  return router;
};