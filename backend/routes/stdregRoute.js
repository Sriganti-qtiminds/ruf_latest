const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const StudioregionsControllers=require("../controllers/studio/studio_regions");
const StudioregionsController=new StudioregionsControllers();


router.post("/addregionsInfo", (req, res) =>
  StudioregionsController.addNewRegionsRecord(req, res)
);
router.get("/getregionInfo", (req, res) =>
  StudioregionsController.getAllRegionRecords(req, res)
);
router.put("/updateregionInfo", (req, res) =>
  StudioregionsController.updateRegionRecord(req, res)
);
router.delete("/deleteregionInfo", (req, res) =>
  StudioregionsController.deleteRegionRecord(req, res)
);
module.exports = router;