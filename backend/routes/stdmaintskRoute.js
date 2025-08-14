const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const studiomaintask=require("../controllers/studio/studio_maintask")
const studiomaintaskcontroller=new studiomaintask();
router.post("/addNewStudioMainTask",(req,res)=>
  studiomaintaskcontroller.addNewStudioMainTask(req,res)
);
router.get("/getAllStudioMainTasks",(req,res)=>
  studiomaintaskcontroller.getAllStudioMainTasks(req,res)
);
router.put("/updateStudioMainTask",(req,res)=>
  studiomaintaskcontroller.updateStudioMainTask(req,res)
);
router.delete("/deleteStudioMainTask",(req,res)=>
  studiomaintaskcontroller.deleteStudioMainTask(req,res)
);
module.exports = router;
