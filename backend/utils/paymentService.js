const BaseController = require("../utils/baseClass");
const S3Service = require("./s3");
const  TransactionController=require("../utils/transaction")

class PaymentService extends BaseController {
  constructor() {
    super(); // Call constructor of the BaseController to initialize services
  }

  async createOrder({ Inv_Id, notes = {}, expire_by = null }) {
    console.log("invoices order", Inv_Id);
    try {
      // Step 1: Fetch the invoice total amount
      const invoice = await this.dbService.getRecordsByFields(
        "dy_invoice",
        "Inv_Total",
        `Inv_Id = '${Inv_Id}'`
      );
      console.log("invoice", invoice);
      if (!invoice.length) {
        throw new Error(`Invoice with ID ${Inv_Id} not found.`);
      }

      const T_amount = parseFloat(invoice[0].Inv_Total); // Extract and convert amount

      if (isNaN(T_amount) || T_amount <= 0) {
        throw new Error(`Invalid invoice amount for ID ${Inv_Id}.`);
      }

      const options = {
        amount: Math.round(T_amount * 100), // Convert to paise
        currency: "INR",
        notes: { ...notes, Inv_Id }, // Store Inv_Id inside notes
        ...(expire_by && { expire_by }), // Include only if provided
        payment_capture: 1, // Auto-capture payment
      };

      // Check if payment already exists for this invoice
      const existingPayment = await this.dbService.getRecordsByFields(
        "dy_payments_info",
        "id",
        `Inv_Id = '${Inv_Id}' AND Payment_Status = 'captured'`
      );
      console.log("existingPayment", existingPayment);

      if (existingPayment.length) {
        console.warn(`Payment already exists for Invoice ID: ${Inv_Id}`);
        throw new Error(
          "A payment has already been captured for this invoice."
        );
      }

      // Create order via Razorpay
      const order = await this.razorpay.orders.create(options);

      console.log("✅ Order created successfully:", order);
      return order;
    } catch (error) {
      console.error("❌ Error in createOrder:", error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }



  async verifyPayment({
    razorpay_payment_id,
    razorpay_order_id,
    Inv_Id,
    payment_mode,
    user_id,
    prop_id,
  }) {
    console.log("Verifying payment for Invoice:", Inv_Id);
    try {
      // Fetch payment details from Razorpay
      const paymentData = await this.razorpay.payments.fetch(
        razorpay_payment_id
      );
      console.log("Fetched Payment Details:", paymentData);

      if (paymentData.order_id !== razorpay_order_id) {
        return { success: false, message: "Payment details mismatched" };
      }

      const paymentDateTime = new Date((paymentData.created_at + 19800) * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const paymentDueDate = new Date(
        new Date(paymentDateTime).setMonth(
          new Date(paymentDateTime).getMonth() + 11
        )
      )
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // Insert payment details into `dy_payments_info`
      await this.dbService.addNewRecord(
        "dy_payments_info",
        "Payment_Id, Inv_Id, Payment_Mode, Razor_Pay_Order_Id, Razor_Pay_Payment_DateTime, Payment_Status",
        `'${paymentData.id}', '${Inv_Id}', '${payment_mode}', '${paymentData.order_id}', '${paymentDateTime}', '${paymentData.status}'`
      );

      // Validate payment status
      if (paymentData.status === "captured") {
        console.log("Payment verified successfully. Creating receipt...");

        // **Fetch Invoice Data from S3**
        const fileKey = `users/${user_id}/invoices/${Inv_Id}_${prop_id}.json`;
        let invData;
        try {
          invData = await S3Service.getJsonFromS3(fileKey);
          if (!invData) {
            throw new Error("Invoice data not found in S3");
          }
        } catch (error) {
          console.error("Error fetching invoice from S3:", error);
          return {
            success: false,
            message: "Failed to fetch invoice data from S3",
          };
        }
        console.log("Fetched Invoice Data:", invData);

        // **Generate Receipt_Id**
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;

        const latestReceipt = await this.dbService.getRecordsByFields(
          "dy_receipt",
          "Receipt_Id",
          `Receipt_Id LIKE 'RRR-${yearMonth}-%' ORDER BY CAST(SUBSTRING_INDEX(Receipt_Id, '-', -1) AS UNSIGNED) DESC LIMIT 1`
        );

        let nextSequence = 1;
        if (latestReceipt.length) {
          const lastReceiptId = latestReceipt[0].Receipt_Id;
          const lastSequence =
            parseInt(lastReceiptId.split("-").pop(), 10) || 0;
          nextSequence = lastSequence + 1;
        }

        // Remove zero padding, start from 1 onwards
        const Receipt_Id = `RRR-${yearMonth}-${nextSequence}`;
        console.log(`Generated Receipt_Id: ${Receipt_Id}`);

        // **Insert into `dy_receipt`**
        await this.dbService.addNewRecord(
          "dy_receipt",
          "Receipt_Id, Payment_Id, Payment_DateTime",
          `'${Receipt_Id}', '${razorpay_payment_id}', '${paymentDateTime}'`
        );

        console.log(`New receipt added with Receipt_Id: ${Receipt_Id}`);

        // **Attach receipt details**
        const receiptData = {
          Receipt_Id,
          Payment_Id: razorpay_payment_id,
          Payment_DateTime: paymentDateTime,
          Payment_DueDate: paymentDueDate, // Added 11 months
          Inv_Id,
          Payment_Mode: payment_mode,
          Payment_Status: paymentData.status,
          ...invData,
        };

        // **Upload Receipt to S3**
        const s3Key = `users/${user_id}/receipts/${Receipt_Id}_${prop_id}.json`;
        try {
          await S3Service.uploadJsonToS3(
            s3Key,
            JSON.stringify(receiptData, null, 2)
          );
          console.log(`Receipt uploaded to S3: ${s3Key}`);
        } catch (error) {
          console.error("Error uploading receipt to S3:", error);
          return { success: false, message: "Failed to upload receipt to S3" };
        }

        // **Now update `dy_transactions` cur_stat_code to 20**
        const transactionCheck = await this.dbService.getRecordsByFields(
          "dy_transactions",
          "id",
          `user_id = '${invData.tenant_id}' AND prop_id = ${invData.property_id} AND cur_stat_code = 18`
        );

        if (transactionCheck.length) {
          await this.dbService.updateRecord(
            "dy_transactions",
            { cur_stat_code: 20 },
            `user_id = '${invData.tenant_id}' AND prop_id = ${invData.property_id} AND cur_stat_code = 18`
          );
          await this.dbService.updateRecord(
            "dy_property",
            { current_status: 24 },
            `user_id = '${invData.owner_id}' AND id = ${invData.property_id}`
          );
          console.log(
            "dy_transactions updated with cur_stat_code = 20 And Propert moved to Rented = 24"
          );
        } else {
          console.warn(
            "No matching transaction found for update (cur_stat_code != 18 or user/property mismatch)."
          );
        }

        return {
          success: true,
          message:
            "Payment verified, transaction updated, and receipt created successfully",
          receiptData,
          s3Location: `${process.env.S3_LOCATION}/${s3Key}`,
        };
      } else {
        return { success: false, message: "Invalid payment or order mismatch" };
      }
    } catch (error) {
      console.error("Error in PaymentService.verifyPayment:", error);
      throw new Error(error.message);
    }
  }
}
module.exports = PaymentService;
