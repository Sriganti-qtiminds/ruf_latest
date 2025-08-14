const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const studiopayment=require("../controllers/studio/studio_user_payment");
const studiopayments=new studiopayment();
router.post("/addNewStudiouserPayment",(req,res)=>
  studiopayments.addNewStudiouserPayment(req,res)
);
router.get("/getAllStudiouserPayments",(req,res)=>
  studiopayments.getAllStudiouserPayments(req,res)
);
router.put("/updateStudiouserPayment",(req,res)=>
  studiopayments.updateStudiouserPayment(req,res)
);
router.delete("/deleteStudiouserPayment",(req,res)=>
  studiopayments.deleteStudiouserPayment(req,res)
);
module.exports = router;