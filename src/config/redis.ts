import Redis, { RedisOptions } from "ioredis";
import logger from "../utils/logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Parse the Redis URL
const redisConfig = new URL(redisUrl);

export const redisOptions: RedisOptions = {
  host: redisConfig.hostname || "localhost",
  port: parseInt(redisConfig.port || "6379"),
  password: redisConfig.password || undefined,
  tls: redisConfig.protocol === "rediss:" ? {} : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Only add username if it's present in the URL
if (redisConfig.username) {
  redisOptions.username = redisConfig.username;
}

export const redis = new Redis(redisOptions);

redis.on("connect", () => {
  logger.info(
    `Successfully connected to Redis at ${redisOptions.host}:${redisOptions.port}`
  );
});

redis.on("error", (error) => {
  logger.error(`Redis connection error: ${error.message}`);
});

export default redis;
