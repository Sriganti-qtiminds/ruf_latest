const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const studiovendorpayment=require("../controllers/studio/studio_vendorpayment");
const studiovendorpayments=new  studiovendorpayment();

router.post("/addNewVendorPayment",(req,res)=>
  studiovendorpayments.addNewVendorPayment(req,res)
);

router.get("/getAllVendorPayments",(req,res)=>
  studiovendorpayments.getAllVendorPayments(req,res)
);

router.put("/updateVendorPayment",(req,res)=>
  studiovendorpayments.updateVendorPayment(req,res)
);

router.delete("/deleteVendorPayment",(req,res)=>
  studiovendorpayments.deleteVendorPayment(req,res)
);

module.exports = router;