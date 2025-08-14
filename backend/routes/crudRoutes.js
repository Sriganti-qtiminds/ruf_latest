const express = require("express");
const router = express.Router();

const {
  addNewRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} = require("../controllers/curd");

router.post("/addNewRecord", (req, res) =>
  new addNewRecord().addNewRecord(req, res)
);
router.get("/getRecords", (req, res) => new getRecords().getRecords(req, res));
router.put("/updateRecord", (req, res) =>
  new updateRecord().updateRecord(req, res)
);
router.delete("/deleteRecord", (req, res) =>
  new deleteRecord().deleteRecord(req, res)
);


module.exports = router;
