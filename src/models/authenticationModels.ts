import bcrypt from "bcrypt";
import { mapUserRow } from "../utils/Mapping/mapUser";
import pool from "../config/db";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/Authentication/generateTokens";
import { redisSetKey } from "../config/redis";
import { queries } from "../utils/queryLoader";
import { getEnvVar } from "../utils/getEnvVar";

export const loginService = async (username: string, plainPassword: string) => {
  const query = queries.login;
  const userResult = await pool.query(
    `SELECT * FROM users WHERE username = $1 AND is_active = true`,
    [username],
  );
  console.log(userResult.rows[0]);
  const data = userResult.rows[0];
  if (!data) return null;
  const user = mapUserRow(data);
  if (!user) return null;
  const match = await bcrypt.compare(plainPassword.trim(), user.passwordHash);
  if (!match) return null;
  const payload = {
    userId: user.userId.toString(),
    username: user.username,
    roleId: user.roleId.toString(),
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await storeRefreshToken(username, refreshToken);
  return {
    userId: user.userId,
    username: user.username,
    roleId: user.roleId,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const storeRefreshToken = async (username: string, refreshToken: string) => {
  redisSetKey(
    `refresh_token:${username}`,
    refreshToken,
    parseInt(getEnvVar("REFRESH_TOKEN_EXPIRES_IN_SEC_REDIS")),
  );
};
