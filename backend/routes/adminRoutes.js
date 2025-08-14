const express = require("express");
const router = express.Router();

const {
  AdminController,
  AdminDasboard,
  AdminPropDetails,
  AdminRequests,
  AdminUserManagement,
} = require("../controllers/adminController");
const { TaskController } = require("../controllers/rmController");

const adminController = new AdminController();
const adminDasboard = new AdminDasboard();
const adminPropDetails = new AdminPropDetails();
const adminRequests = new AdminRequests();
const adminUserManagement = new AdminUserManagement();
const taskController = new TaskController();

router.get(
  "/st-tables",
  adminController.getTablesAndFields.bind(adminController)
);
router.get(
  "/admin-st-tables",
  adminController.getTablesAndFields.bind(adminController)
);
router.get("/admindashboard", adminDasboard.AdminDasboard.bind(adminDasboard));
router.get("/admintransactions", taskController.getTasks.bind(taskController));
router.get(
  "/adminPropListings",
  adminPropDetails.adminPropListings.bind(adminPropDetails)
);
router.get("/adminRequests", adminRequests.adminRequests.bind(adminRequests));
router.get(
  "/adminUserManagement",
  adminUserManagement.adminUserManagement.bind(adminUserManagement)
);

module.exports = router;
