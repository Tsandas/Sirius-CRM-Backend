import pg, { PoolConfig } from "pg";
import { getEnvVar } from "../utils/getEnvVar";
const { Pool } = pg;

const deployEnv = getEnvVar("ENVIRONMENT");
let config: pg.PoolConfig = {};

if (deployEnv === "PROD") {
  console.log("Using AWS PostgreSQL configuration");
  config = {
    user: getEnvVar("AWS_USERNAME"),
    password: getEnvVar("AWS_PASSWORD"),
    host: getEnvVar("AWS_DB_HOST"),
    port: parseInt(getEnvVar("AWS_PG_PORT"), 10),
    database: getEnvVar("AWS_DATABASE"),
    ssl: {
      rejectUnauthorized: false, // simple option for development
    },
  };
} else {
  console.log("Using Aiven PostgreSQL configuration");
  config = {
    user: getEnvVar("AIVEN_DB_USER"),
    password: getEnvVar("AIVEN_DB_PASSWORD"),
    host: getEnvVar("AIVEN_DB_HOST"),
    port: parseInt(getEnvVar("AIVEN_DB_PG_PORT"), 10),
    database: getEnvVar("AIVEN_DB_DATABASE"),
    ssl: {
      rejectUnauthorized: true,
      ca: Buffer.from(getEnvVar("AIVEN_DB_CA"), "base64").toString("utf-8"),
    },
  };
}

const pool = new Pool(config);

export default pool;
