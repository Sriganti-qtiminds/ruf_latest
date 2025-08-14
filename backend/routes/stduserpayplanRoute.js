const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const userpayment=require("../controllers/studio/studio_UserPayment_plans");
const studiopaymentsuser=new userpayment();
router.post("/addNewUserPayment",(req,res)=>
  studiopaymentsuser.addNewUserPayment(req,res)
);
router.get("/getAllUserPaymentPlans",(req,res)=>
  studiopaymentsuser.getAllUserPaymentPlans(req,res)
);
router.put("/updateUserPaymentPlan",(req,res)=>
  studiopaymentsuser.updateUserPaymentPlan(req,res)
);
router.delete("/deleteStudioUserPaymentPlan",(req,res)=>
  studiopaymentsuser.deleteStudioUserPaymentPlan(req,res)
);
module.exports = router;