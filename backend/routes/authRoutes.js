const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/signupLogin");
const authController = new AuthController();

router.post("/signup", (req, res) => authController.signup(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/g_login", (req, res) => authController.g_login(req, res));
router.post("/block/:uid", (req, res) => authController.blockUser(req, res));
router.post("/unblock/:uid", (req, res) =>
  authController.unblockUser(req, res)
);
router.post("/referral", (req, res) => authController.referral(req, res));
router.post("/checkMobile", (req, res) => authController.checkMobile(req, res));
router.put("/addMobileNumber", (req, res) =>
  authController.addMobileNumber(req, res)
);

module.exports = router;
