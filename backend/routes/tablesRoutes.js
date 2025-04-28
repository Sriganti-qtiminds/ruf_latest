const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin Initialization

const {
  AdminController,
  AdminDasboard,
  AdminPropDetails,
  AdminRequests,
  AdminUserManagement,
} = require("../controllers/adminController");

// curd Initialization

const {
  addNewRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} = require("../controllers/curdController");

// fm Initialization
const FMController = require("../controllers/fmController");

// rm Initialization
const {
  addRmTask,
  TaskController,
  updateTask,
} = require("../controllers/rmController");

// user Initialization

const {
  PropertyController,
  UserActionsController,
  UserProfile,
  UserController,
  LandMarksController,
  AmenitiesController,
  ServicesController,
  FirebaseController,
} = require("../controllers/tableController");

// signupLogin Initialization

const AuthController = require("../controllers/signupLogin");

// payment Initialization

const PaymentController = require("../controllers/paymentController");

// Admin
const adminController = new AdminController();
const adminDasboard = new AdminDasboard();
const adminPropDetails = new AdminPropDetails();
const adminRequests = new AdminRequests();
const adminUserManagement = new AdminUserManagement();

// curd

const addNewRecordController = new addNewRecord();
const getRecordsController = new getRecords();
const updateRecordController = new updateRecord();
const deleteRecordController = new deleteRecord();

// fm
const fmController = new FMController();

//rm
const assignRmToTransactionController = new addRmTask();
const taskController = new TaskController();
const updateTaskController = new updateTask();

// user
const propertyController = new PropertyController();

const actionsController = new UserActionsController();

const userprofileController = new UserProfile();
const userController = new UserController();
const landmarksController = new LandMarksController();
const allAmenitiesController = new AmenitiesController();
const servicesController = new ServicesController();
const fireBaseController = new FirebaseController();

// signupLogin
const authController = new AuthController();

// payment
const paymentController = new PaymentController();

// Admin Routes
router.get("/st-tables", (req, res) =>
  adminController.getTablesAndFields(req, res)
);
router.get("/admin-st-tables", (req, res) =>
  adminController.getTablesAndFields(req, res)
);
router.get("/admindashboard", (req, res) =>
  adminDasboard.AdminDasboard(req, res)
);
router.get("/admintransactions", (req, res) =>
  taskController.getTasks(req, res)
);
router.get("/adminPropListings", (req, res) =>
  adminPropDetails.adminPropListings(req, res)
);
router.get("/adminRequests", (req, res) =>
  adminRequests.adminRequests(req, res)
);
router.get("/adminUserManagement", (req, res) =>
  adminUserManagement.adminUserManagement(req, res)
);

// curd Routes
router.post("/addNewRecord", (req, res) =>
  addNewRecordController.addNewRecord(req, res)
);
router.get("/getRecords", (req, res) =>
  getRecordsController.getRecords(req, res)
);
router.put("/updateRecord", (req, res) =>
  updateRecordController.updateRecord(req, res)
);
router.delete("/deleteRecord", (req, res) =>
  deleteRecordController.deleteRecord(req, res)
);

// fm Routes
router.get("/getFmList", (req, res) => fmController.getFmList(req, res));
router.get("/communityMapDetails", (req, res) =>
  fmController.getFmList(req, res)
);

router.get("/fmdata", (req, res) => taskController.getTasks(req, res));

// rm Routes
router.post("/addRmTask", (req, res) =>
  assignRmToTransactionController.addRmTask(req, res)
);

router.get("/fmdata", (req, res) => taskController.getTasks(req, res));
router.get("/rmdata", (req, res) => taskController.getTasks(req, res));
router.put("/updateTask", (req, res) =>
  updateTaskController.updateTask(req, res)
);
router.put("/updateRMTask", (req, res) =>
  updateTaskController.updateRMTask(req, res)
);

router.get("/getCommunityImg", (req, res) =>
  propertyController.getAllCommunityImg(req, res)
);

// user Routes
router.post("/AddProperty", upload.array("images", 10), (req, res) =>
  propertyController.createProperty(req, res)
);
router.post("/uploadPdf", upload.array("files", 1), (req, res) =>
  propertyController.uploadPDF(req, res)
);
router.get("/showPropDetails", (req, res) =>
  propertyController.showPropDetails(req, res)
);
router.get("/userpropdetails", (req, res) =>
  propertyController.showPropDetails(req, res)
);
router.get("/usermylistings", (req, res) =>
  propertyController.userPropDetails(req, res)
);
router.get("/getPostData", (req, res) =>
  propertyController.getPostData(req, res)
);
router.get("/filterdata", (req, res) =>
  propertyController.filterdata(req, res)
);
router.get("/actions", (req, res) =>
  actionsController.getUserActions(req, res)
);
router.get("/usermyfavourties", (req, res) =>
  actionsController.getUserActions(req, res)
);
router.get("/userprofile", (req, res) =>
  userprofileController.getUserProfile(req, res)
);
router.get("/roles", (req, res) => userController.getUsersByRole(req, res));
router.get("/staffDetails", (req, res) =>
  userController.getUsersByRole(req, res)
);

router.get("/landmarks", (req, res) => landmarksController.landMarks(req, res));
router.post("/landmarks", (req, res) =>
  landmarksController.addLandmarks(req, res)
);
router.post("/importLandmarks", (req, res) =>
  landmarksController.importLandmarks(req, res)
);
router.get("/amenities", (req, res) => {
  allAmenitiesController.getAmenities(req, res);
});
router.post("/addamenities", (req, res) => {
  allAmenitiesController.addAmenities(req, res);
});

router.post("/importamenities", (req, res) => {
  allAmenitiesController.importAmenities(req, res);
});

router.post("/createCommunity", upload.array("images", 1), (req, res) => {
  allAmenitiesController.createCommunity(req, res);
});

router.get("/getUserTransactions", (req, res) =>
  propertyController.getUserTransactions(req, res)
);
router.get("/getPropertyRecieptList", (req, res) =>
  propertyController.getPropertyRecieptList(req, res)
);
router.get("/coins", (req, res) => servicesController.CoinsHistory(req, res));
router.get("/getServiceDetails", (req, res) =>
  servicesController.getServiceDetails(req, res)
);
router.post("/claimservices", (req, res) =>
  servicesController.createServiceInfo(req, res)
);
router.get("/getEnquirerCatCode", (req, res) =>
  userController.getEnquirerCatCode(req, res)
);
router.post("/addNewEnquiryRecord", (req, res) =>
  userController.addNewEnquiryRecord(req, res)
);

router.get("/getenqdata", (req, res) =>
  propertyController.getPostData(req, res)
);

router.get("/getNewEnquiryRecord", (req, res) =>
  userController.getNewEnquiryRecord(req, res)
);

router.put("/updatenq", (req, res) => userController.updateEnquiry(req, res));

router.post("/addChatbotEntry", (req, res) =>
  userController.addChatbotEntry(req, res)
);

router.post("/uploadPdf", upload.array("files", 1), (req, res) =>
  propertyController.uploadPDF(req, res)
);

router.post("/getPdf", (req, res) =>
  propertyController.getPDFController(req, res)
);
router.get("/getUsersBySignupDate", (req, res) =>
  servicesController.getUsersBySignupDate(req, res)
);

router.get("/getPropertiesByListingDate", (req, res) =>
  servicesController.getPropertiesByListingDate(req, res)
);
router.get("/countUsers", (req, res) =>
  fireBaseController.getAnalyticsData(req, res)
);

router.put("/updateProperty", upload.array("images", 10), (req, res) =>
  propertyController.updateProperty(req, res)
);

// signupLoginRoutes.js

router.post("/signup", (req, res) => authController.signup(req, res));

router.post("/login", (req, res) => authController.login(req, res));
router.post("/g_login", (req, res) => authController.g_login(req, res));

router.post("/block/:uid", (req, res) => authController.blockUser(req, res));
router.post("/unblock/:uid", (req, res) =>
  authController.unblockUser(req, res)
);

router.post("/referral", (req, res) => authController.referral(req, res));
router.post("/checkMobile", (req, res) => authController.checkMobile(req, res));
router.put("/addMobileNumber", (req, res) =>
  authController.addMobileNumber(req, res)
);

// payment Routes

router.post("/create-order", (req, res) =>
  paymentController.createOrder(req, res)
);
router.post("/verify-payment", (req, res) =>
  paymentController.verifyPayment(req, res)
);

module.exports = router;
