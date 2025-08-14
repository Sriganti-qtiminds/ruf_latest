const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

  const propertyController = new PropertyController();
  const actionsController = new UserActionsController();
  const userprofileController = new UserProfile();
  const userController = new UserController();
  const landmarksController = new LandMarksController();
  const amenitiesController = new AmenitiesController();
  const servicesController = new ServicesController();
  const firebaseController = new FirebaseController();

  //propertyController
  router.post("/AddProperty", upload.array("images", 10), (req, res) =>
  propertyController.createProperty(req, res)
);
router.post("/uploadPdf", upload.array("files", 1), (req, res) =>
  propertyController.uploadPDF(req, res)
);
router.get("/showPropDetails", (req, res) =>
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
router.get("/getCommunityImg", (req, res) =>
  propertyController.getAllCommunityImg(req, res)
);
router.put("/updateProperty", upload.array("images", 10), (req, res) =>
  propertyController.updateProperty(req, res)
);

router.post("/getPdf", (req, res) =>
  propertyController.getPDFController(req, res)
);

router.get("/getUserTransactions", (req, res) =>
  propertyController.getUserTransactions(req, res)
);
router.get("/fetchAndCacheAllAmenities", (req, res) =>
  propertyController.fetchAndCacheAllAmenities(req, res)
);
//actionsController
router.get("/usermyfavourties", (req, res) =>
  actionsController.getUserActions(req, res)
);
router.get("/userprofile", (req, res) =>
  userprofileController.getUserProfile(req, res)
);
router.post(
  "/addNewTestimonialRecord",
  upload.single("images"), // Change from .array() to .single()
  (req, res) => userController.addNewTestimonialRecord(req, res)
);

router.get("/getNewTestimonialRecord", (req, res) =>
  userController.getNewtestimonialRecord(req, res)
);

router.get("/getAllTestimonialRecords", (req, res) =>
  userController.getAllTestimonialRecords(req, res)
);
router.delete("/deleteNewTestimonialRecord", (req, res) =>
  userController.deleteTestimonialRecord(req, res)
);
router.put("/updateNewTestimonialRecord", (req, res) =>
  userController.updateTestimonialRecord(req, res)

);
router.get("/getNewEnquiryRecord", (req, res) =>
  userController.getNewEnquiryRecord(req, res)
);

router.put("/updatenq", (req, res) => userController.updateEnquiry(req, res));

router.post("/addChatbotEntry", (req, res) =>
  userController.addChatbotEntry(req, res)
);
router.get("/getEnquirerCatCode", (req, res) =>
  userController.getEnquirerCatCode(req, res)
);
router.post("/addNewEnquiryRecord", (req, res) =>
  userController.addNewEnquiryRecord(req, res)
);
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
  amenitiesController.getAmenities(req, res);
});
router.post("/addamenities", (req, res) => {
  amenitiesController.addAmenities(req, res);
});

router.post("/importamenities", (req, res) => {
  amenitiesController.importAmenities(req, res);
});

router.post("/createCommunity", upload.array("images", 1), (req, res) => {
  amenitiesController.createCommunity(req, res);
});
router.get("/getUsersBySignupDate", (req, res) =>
  servicesController.getUsersBySignupDate(req, res)
);

router.get("/getPropertiesByListingDate", (req, res) =>
  servicesController.getPropertiesByListingDate(req, res)
);

router.get("/getServiceDetails", (req, res) =>
  servicesController.getServiceDetails(req, res)
);
router.post("/claimservices", (req, res) =>
  servicesController.createServiceInfo(req, res)
);
router.get("/countUsers", (req, res) =>
firebaseController.getAnalyticsData(req, res)
);




  


module.exports = router;
