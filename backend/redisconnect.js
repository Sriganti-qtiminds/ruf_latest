const redis = require("redis");

// Replace with your Redis endpoint
const redisClient = redis.createClient({
  socket: {
    host: "rufrent-redis.a0bk1v.ng.0001.aps1.cache.amazonaws.com", // e.g., "your-redis-instance.region.cloudprovider.com"
    port: 6379, // Default Redis port
  },
//   password: "", // If authentication is required
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");

    // Example: Set and Get a key-value pair
    await redisClient.set("testKey", "Hello Redis");
    const value = await redisClient.get("testKey");
    console.log("Retrieved value:", value);

    // Close the connection
    await redisClient.quit();
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();
