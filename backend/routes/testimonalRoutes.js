const express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
    testimonialController
  
} = require("../controllers/testminal");

const testimonial = new testimonialController();


router.post(
  "/addNewTestimonialRecord",
  upload.single("images"), 
  (req, res) => testimonial.addNewTestimonialRecord(req, res)
);

router.get("/getNewTestimonialRecord", (req, res) =>
  testimonial.getNewtestimonialRecord(req, res)
);

router.get("/getAllTestimonialRecords", (req, res) =>
  testimonial.getAllTestimonialRecords(req, res)
);
router.delete("/deleteNewTestimonialRecord", (req, res) =>
  testimonial.deleteTestimonialRecord(req, res)
);
router.put("/updateNewTestimonialRecord", (req, res) =>
  testimonial.updateTestimonialRecord(req, res)
);
module.exports = router;