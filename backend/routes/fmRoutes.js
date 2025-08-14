const express = require("express");
const router = express.Router();

const FMController = require("../controllers/fmController");
const TaskController = require("../controllers/rmController").TaskController;

const fmController = new FMController();
const taskController = new TaskController();

router.get("/getFmList", (req, res) => fmController.getFmList(req, res));
router.get("/communityMapDetails", (req, res) =>
  fmController.getFmList(req, res)
);
router.get("/fmdata", (req, res) => taskController.getTasks(req, res));

module.exports = router;
