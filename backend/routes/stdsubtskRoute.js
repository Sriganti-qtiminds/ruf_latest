const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const studiosubtask=require("../controllers/studio/studio_subtasks")
const studiosubtaskcontroller=new studiosubtask();
router.post("/addNewStudioSubTask",(req,res)=>
  studiosubtaskcontroller.addNewStudioSubTask(req,res)
);
router.get("/getAllStudioSubTasks",(req,res)=>
  studiosubtaskcontroller.getAllStudioSubTasks(req,res)
);
router.put("/updateStudioSubTask",(req,res)=>
  studiosubtaskcontroller.updateStudioSubTask(req,res)
);
router.delete("/deleteStudioSubTask",(req,res)=>
  studiosubtaskcontroller.deleteStudioSubTask(req,res)
);
module.exports = router;