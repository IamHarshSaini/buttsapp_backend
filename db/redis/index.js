const redis = require("redis");

let client = null;

const initializeRedisClient = () => {
  if (!client) {
    client = redis.createClient({
      url: "redis://localhost:6379",
    });

    client.on("connect", () => {
      console.log("Connected to Redis");
    });

    client.on("error", (err) => {
      console.error("Redis error:", err);
    });

    client.on("reconnecting", () => {
      console.log("Reconnecting to Redis...");
    });

    client.on("end", () => {
      console.log("Redis client disconnected");
    });
  }

  if (!client.isOpen) {
    client.connect().catch((err) => {
      console.error("Failed to connect to Redis:", err);
    });
  }

  return client;
};

module.exports = initializeRedisClient();
