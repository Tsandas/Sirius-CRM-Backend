import Redis from "ioredis";
import { getEnvVar } from "../utils/getEnvVar";

let client: Redis;
if (getEnvVar("ENVIRONMENT") === "PROD") {
  console.log("Using AWS Redis configuration");
  client = new Redis({
    host: getEnvVar("AWS_REDIS_URL"),
    port: parseInt(getEnvVar("AWS_REDIS_PORT")) || 6379,
    tls: {},
  });
} else {
  console.log("Using Upstash Redis configuration");
  client = new Redis(getEnvVar("UPSTASH_REDIS_URL"));
}

const redisSetKey = async (key: string, value: string, expireInSec: number) => {
  await client.set(key, value, "EX", expireInSec);
};

const redisGetKey = async (key: string) => {
  return await client.get(key);
};

const connectRedis = async () => {
  return new Promise((resolve, reject) => {
    client.on("ready", () => resolve(true));
    client.on("error", (err) => reject(err));
  });
};

export { redisSetKey, redisGetKey, connectRedis };
