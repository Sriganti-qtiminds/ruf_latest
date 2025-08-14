const express = require("express");
const router = express.Router();

const {
  addRmTask,
  TaskController,
  updateTask,
} = require("../controllers/rmController");

const assignRmToTransactionController = new addRmTask();
const taskController = new TaskController();
const updateTaskController = new updateTask();

router.post("/addRmTask", (req, res) =>
  assignRmToTransactionController.addRmTask(req, res)
);
router.get("/rmdata", (req, res) => taskController.getTasks(req, res));
router.put("/updateTask", (req, res) =>
  updateTaskController.updateTask(req, res)
);
router.put("/updateRMTask", (req, res) =>
  updateTaskController.updateRMTask(req, res)
);

module.exports = router;
