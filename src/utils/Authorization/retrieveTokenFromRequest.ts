import { Request } from "express";

export const extractToken = (req: Request): string | null => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token) return token;
  }
  return null;
};

export const extractRefreshToken = (req: Request): string | null => {
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }
  if (
    req.headers["x-refresh-token"] &&
    typeof req.headers["x-refresh-token"] === "string"
  ) {
    return req.headers["x-refresh-token"];
  }
  return null;
};

export const extractAdminToken = (req: Request): string | null => {
  if (
    req.headers["x-admin-token"] &&
    typeof req.headers["x-admin-token"] === "string"
  ) {
    return req.headers["x-admin-token"];
  }
  return null;
};
