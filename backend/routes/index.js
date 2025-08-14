const express = require("express");
const multer = require("multer");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import modular route handlers
const adminRoutes = require("./adminRoutes");
const crudRoutes = require("./crudRoutes");
const fmRoutes = require("./fmRoutes");
const rmRoutes = require("./rmRoutes");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const paymentRoutes = require("./paymentRoutes");
const notificationRoutes = require("./notificationRoutes");
const testminalRoutes = require("./testimonalRoutes");
const invoiceRoutes = require("./stdinvRoute");
const maintaskRoutes = require("./stdmaintskRoute");
const subtaskRoutes = require("./stdsubtskRoute");
const subpaymentRoutes = require("./stduserpayRoute");
const vendorRoutes = require("./stdvenRoute");
const vendorpaymentRoutes = require("./stdvendorpayRoute");
const projectRoutes = require("./stdprojRoute");
const regionsRoutes = require("./stdregRoute");

const userpayment = require("./stduserpayplanRoute");

router.use("/admin", adminRoutes);
router.use("", crudRoutes);
router.use("/fm", fmRoutes);
router.use("/rm", rmRoutes);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/pay", paymentRoutes);
router.use("/noti", notificationRoutes);
router.use("/test", testminalRoutes);
router.use("/invoice", invoiceRoutes);
router.use("/maintask", maintaskRoutes);
router.use("/subtask", subtaskRoutes);
router.use("/payment", subpaymentRoutes);
router.use("/vendor", vendorRoutes);
router.use("/vendorpayment", vendorpaymentRoutes);
router.use("/project", projectRoutes);
router.use("/regions", regionsRoutes);
router.use("/userpayment", userpayment);

module.exports = router;
