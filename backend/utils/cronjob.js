const cron = require("node-cron");
const db = require("../config/db"); // Adjust the path as per your project structure
const DatabaseService = require("../utils/service");
const dbService = new DatabaseService();
const TransactionController = require("../utils/transaction");

function setupNotificationScheduler(io, onlineUsers) {
  async function sendScheduledNotifications() {
    try {
      const tableName = "dy_notifications";
      const columns = `
            dy_notifications.Id, 
            dy_notifications.User_Id, 
            dy_notifications.Notification_Id, 
            dy_notifications.CreateTime, 
            dy_notifications.c_cnt, 
            dy_notifications.LastSentTime, 
            st_notifications.Type, 
            st_notifications.Text, 
            st_notifications.Frequency, 
            st_notifications.max_counter
            `;
      const joinClause =
        "JOIN st_notifications ON dy_notifications.Notification_Id = st_notifications.id";
      const whereClause =
        "dy_notifications.c_cnt <= st_notifications.max_counter AND dy_notifications.c_cnt >= 0";

      const notifications = await dbService.getJoinedData(
        tableName,
        joinClause,
        columns,
        whereClause
      );
      const currentTime = new Date();

      for (const noti of notifications) {
        const {
          Id,
          User_Id,
          Notification_Id,
          CreateTime,
          c_cnt,
          LastSentTime,
          Type,
          Text,
          Frequency,
          max_counter,
        } = noti;

        let sendNotification = false;
        const lastSentTime = LastSentTime
          ? new Date(LastSentTime)
          : new Date(CreateTime);
        const timeDiff = currentTime - lastSentTime;
        const frequency = Frequency ? Frequency.toLowerCase() : "";

        switch (frequency) {
          case "daily":
            sendNotification = timeDiff >= 24 * 60 * 60 * 1000;
            break;
          case "weekly":
            sendNotification = timeDiff >= 7 * 24 * 60 * 60 * 1000;
            break;
          case "monthly":
            sendNotification = timeDiff >= 30 * 24 * 60 * 60 * 1000;
            break;
          case "1":
            sendNotification = c_cnt === 1;
            break;
          default:
            console.warn(`⚠️ Unknown frequency: ${Frequency}`);
        }

        if (sendNotification) {
          console.log(`📢 Sending Notification to User ${User_Id}: ${Text}`);

          await dbService.updateRecord(
            "dy_notifications",
            { c_cnt: c_cnt + 1, LastSentTime: new Date() },
            `Id = ${db.escape(Id)}`
          );

          if (c_cnt + 1 >= max_counter) {
            await dbService.updateRecord(
              "dy_notifications",
              { c_cnt: -1 },
              `Id = ${db.escape(Id)}`
            );
            continue;
          }

          const targetSocketId = onlineUsers.get(User_Id.toString());
          if (targetSocketId) {
            io.of("/api/notifications")
              .to(targetSocketId)
              .emit("receiveNotification", noti);
            console.log(`✅ Notification sent to user ${User_Id}`);
          } else {
            console.log(
              `⚠️ User ${User_Id} is offline. Notification saved to database.`
            );
          }
        }
      }

      console.log("✅ Scheduled Notifications Sent Successfully");
    } catch (error) {
      console.error("❌ Error sending notifications:", error.message, error);
    }
  }

  async function deleteOldReadNotifications() {
    try {
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12); // Subtract 12 hours

      // Manually format the date as 'YYYY-MM-DD HH:mm:ss' (local time)
      const year = twelveHoursAgo.getFullYear();
      const month = String(twelveHoursAgo.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
      const day = String(twelveHoursAgo.getDate()).padStart(2, "0");
      const hours = String(twelveHoursAgo.getHours()).padStart(2, "0");
      const minutes = String(twelveHoursAgo.getMinutes()).padStart(2, "0");
      const seconds = String(twelveHoursAgo.getSeconds()).padStart(2, "0");

      const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      const deleteCondition = `Status = '1' AND c_cnt = -1 AND LastSentTime < '${formattedTime}'`;
      console.log("deleteCondition", deleteCondition);

      const ress = await dbService.deleteRecord(
        "dy_notifications",
        deleteCondition
      );
      console.log("ress from the deleting ", ress);
      console.log("🗑️ Deleted old read notifications.");
    } catch (error) {
      console.error("❌ Error deleting old notifications:", error.message);
    }
  }

  cron.schedule("0 0 * * *", sendScheduledNotifications, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  });

  cron.schedule("0 0 * * *", deleteOldReadNotifications, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  });

  console.log("⏳ Notification Scheduler is Running...");
}

module.exports = setupNotificationScheduler;
