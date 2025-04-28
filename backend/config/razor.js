const dotenv = require("dotenv");
dotenv.config();
const Razorpay = require("razorpay");

class RazorpayService {
    constructor() {
        if (!RazorpayService.instance) {
            this.razorpay = new Razorpay({
                key_id: process.env.RAZOR_KEY_ID,
                key_secret: process.env.RAZOR_KEY_SECRET,
            });
            RazorpayService.instance = this;
        }
        return RazorpayService.instance;
    }

    getInstance() {
        return this.razorpay;
    }
}

module.exports = new RazorpayService(); // Ensure a single instance is shared