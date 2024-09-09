const redis = require('redis');

// Create a new Redis client instance with default settings
const client = redis.createClient({
  url: 'redis://localhost:6379' // URL format for Redis connection
});

// Listen for the 'connect' event
client.on('connect', () => {
  console.log('Connected to Redis');
});

// Listen for the 'error' event
client.on('error', (err) => {
  console.error('Redis error:', err);
});
