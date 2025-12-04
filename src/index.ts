import dotenv from "dotenv";
dotenv.config({ override: true });

import app from "./server";
import { getEnvVar } from "./utils/getEnvVar";
import pool from "./config/db";
import { connectRedis } from "./config/redis";

async function bootstrap() {
  try {
    await pool
      .connect()
      .then(() => console.log("Connected to PostgreSQL with SSL"))
      .catch((err: Error) =>
        console.error("Error connecting to PostgreSQL:", err)
      );

    await await connectRedis();

    app.listen(getEnvVar("SERVER_PORT"), () => {
      console.log(`Server is running on port ${getEnvVar("SERVER_PORT")}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

bootstrap();
