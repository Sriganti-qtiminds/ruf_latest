const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage
});
const StudioProject = require("../controllers/studio/studio_project");
const StudioProjectController = new StudioProject();

router.post(
  "/addstudioproject",
  upload.fields([   
    { name: "pdfs", maxCount: 5 }      
  ]),
  (req, res) => StudioProjectController.addNewStudioProject(req, res)
);


router.get("/getAllStudioProjects", (req, res) =>
  StudioProjectController.getAllStudioProjects(req, res)
);
router.get("/getProjectDocuments", (req, res) =>
  StudioProjectController.getProjectDocuments(req, res)
);


router.put(
  "/updateStudioProject",
  upload.fields([
    { name: "pdfs", maxCount: 5 }  // allow up to 5 pdf uploads
  ]),
  (req, res) => StudioProjectController.updateStudioProject(req, res)
);

router.delete("/deleteStudioProject", (req, res) =>
  StudioProjectController.deleteStudioProject(req, res)
);
module.exports = router;
