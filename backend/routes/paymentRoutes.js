const express = require("express");
const router = express.Router();

const PaymentController = require("../controllers/paymentController");
const paymentController = new PaymentController();

router.post("/create-order", (req, res) =>
  paymentController.createOrder(req, res)
);
router.post("/verify-payment", (req, res) =>
  paymentController.verifyPayment(req, res)
);

module.exports = router;
