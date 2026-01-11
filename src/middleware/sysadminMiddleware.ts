import { responseHandler } from "../utils/responseHandler";
import { RequestWithToken } from "../types/requests";
import { NextFunction, Response } from "express";
import { getEnvVar } from "../utils/getEnvVar";
import { extractAdminToken } from "../utils/Authorization/retrieveTokenFromRequest";

export const verifyAdminToken = (
  req: RequestWithToken,
  res: Response,
  next: NextFunction
) => {
  const token = extractAdminToken(req);
  if (!token) {
    return responseHandler(
      res,
      401,
      "No admin token provided, authorization denied"
    );
  }
  if (token !== getEnvVar("ADMIN_ACCESS_TOKEN")) {
    return responseHandler(res, 401, "Invalid admin refresh token");
  }
  next();
};
