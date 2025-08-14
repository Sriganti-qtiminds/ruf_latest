const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const StudioinvoiceControllers=require("../controllers/studio/studio_invoice")
const studioinvoice=new StudioinvoiceControllers();

router.post("/addinvoiceInfo", (req, res) =>
  studioinvoice. addNewInvoiceRecord(req, res)
);
router.get("/getinvoiceInfo", (req, res) =>
  studioinvoice. getAllInvoiceRecords(req, res)
);
router.put("/updateinvoiceInfo", (req, res) =>
  studioinvoice.  updateInvoiceRecord(req, res)
);
router.delete("/deleteinvoiceInfo", (req, res) =>
  studioinvoice.  deleteInvoiceRecord(req, res)
);
module.exports = router;
