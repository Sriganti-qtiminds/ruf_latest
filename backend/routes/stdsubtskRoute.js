const express = require("express");
const multer = require("multer");
const router = express.Router();
const studiosubtask = require("../controllers/studio/studio_subtasks");
const studiosubtaskcontroller = new studiosubtask();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });


router.post(
  "/addNewStudioSubTask",
  upload.fields([
    { name: "beforeImages", maxCount: 10 },
    { name: "afterImages", maxCount: 10 },
    { name: "beforeVideos", maxCount: 5 },
    { name: "afterVideos", maxCount: 5 },
  ]),
  (req, res) => studiosubtaskcontroller.addNewStudioSubTask(req, res)
);


router.get("/getAllStudioSubTasks", (req, res) => studiosubtaskcontroller.getAllStudioSubTasks(req, res));
router.get("/getAllStudioSubTaskscount", (req, res) => studiosubtaskcontroller.getAllStudioSubTaskscount(req, res));


router.put(
  "/updateStudioSubTask",
  upload.fields([
    { name: "beforeImages", maxCount: 10 },
    { name: "afterImages", maxCount: 10 },
    { name: "beforeVideos", maxCount: 5 },
    { name: "afterVideos", maxCount: 5 }
  ]),
  (req, res) => studiosubtaskcontroller.updateStudioSubTask(req, res)
);
router.delete("/deleteStudioSubTask", (req, res) => studiosubtaskcontroller.deleteStudioSubTask(req, res));
router.get("/getFilteredMediaFilePaths", (req, res) => studiosubtaskcontroller.getFilteredMediaFilePaths(req, res));

module.exports = router;




