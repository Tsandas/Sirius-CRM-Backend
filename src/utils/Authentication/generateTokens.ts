import jwt from "jsonwebtoken";
import { JWTPayload } from "../../types/auth";
import type { StringValue } from "ms";
import { getEnvVar } from "../getEnvVar";

export const generateAccessToken = ({
  iat,
  exp,
  ...payload
}: JWTPayload): string => {
  return jwt.sign(payload, getEnvVar("ACCESS_TOKEN_SECRET") as string, {
    expiresIn: getEnvVar("ACCESS_TOKEN_EXPIRES_IN_SEC_JWT") as StringValue,
  });
};

export const generateRefreshToken = ({
  iat,
  exp,
  ...payload
}: JWTPayload): string => {
  return jwt.sign(payload, getEnvVar("REFRESH_TOKEN_SECRET") as string, {
    expiresIn: getEnvVar("REFRESH_TOKEN_EXPIRES_IN_SEC_JWT") as StringValue,
  });
};
