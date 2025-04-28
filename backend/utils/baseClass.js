const DatabaseService = require('../utils/service');
const AdminManager = require('../utils/admin'); 
const RazorpayService = require("../config/razor"); // Already initialized singleton
const { S3Client, ListObjectsV2Command ,PutObjectCommand } = require('@aws-sdk/client-s3');


class BaseController {
    constructor() {
      this.dbService = new DatabaseService();
      this.tableManager = new AdminManager(); 
      this.razorpay = RazorpayService.getInstance(); // Use Singleton Instance
      this.s3 = new S3Client({ region: process.env.AWS_REGION });


    }
  
  }

  
  module.exports = BaseController;
  