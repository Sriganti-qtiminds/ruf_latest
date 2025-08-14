const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, 
});
const StudioProject=require("../controllers/studio/studio_project")
const StudioProjectController = new StudioProject();
// router.post("/addstudioproject",upload.fields([
//     { name: "images", maxCount: 10 },
//     { name: "videos", maxCount: 5 },
//   ]),(req,res)=>
//   StudioProjectController.addNewStudioProject(req,res)
// );

router.post(
  "/addstudioproject",
  upload.fields([
  { name: "beforeImages", maxCount: 10 },
  { name: "afterImages", maxCount: 10 },
  { name: "beforeVideos", maxCount: 5 },
  { name: "afterVideos", maxCount: 5 },
])
,
  (req, res) => StudioProjectController.addNewStudioProject(req, res)
);


router.get("/getAllStudioProjects", (req, res) =>
  StudioProjectController.getAllStudioProjects(req, res)
);
router.put("/updateStudioProject", (req, res) =>
  StudioProjectController.updateStudioProject(req, res)
);
router.delete("/deleteStudioProject", (req, res) =>
  StudioProjectController.deleteStudioProject(req, res)
);
module.exports = router;
