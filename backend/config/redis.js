const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST, // Ensure this is correctly set in .env
  port: process.env.REDIS_PORT, // Ensure this is correctly set in .env
  connectTimeout: 10000,
});

module.exports = redis;
