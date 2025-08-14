const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const  studiovendors=require("../controllers/studio/studio_vendor"

 )
 const StudiovendorsControllers= new studiovendors();
 router.post("/addvendorInfo", (req, res) =>
  StudiovendorsControllers.addNewVendor(req, res)
);
router.get("/getvendorInfo", (req, res) =>
  StudiovendorsControllers.getAllVendors(req, res)
);
router.put("/updatevendorInfo", (req, res) =>
  StudiovendorsControllers.updateVendorRecord(req, res)
);
router.delete("/deletevendorInfo", (req, res) =>
  StudiovendorsControllers.deleteVendorRecord(req, res)
);
module.exports = router;