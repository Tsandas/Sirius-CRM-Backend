import { responseHandler } from "../utils/responseHandler";
import { RequestWithBodyAndParams, RequestWithToken } from "../types/requests";
import { NextFunction, Response } from "express";
import {
  decodeAccessToken,
  decodeRefreshToken,
} from "../utils/Authorization/verifyToken";
import {
  extractRefreshToken,
  extractToken,
} from "../utils/Authorization/retrieveTokenFromRequest";

export const verifyAccessToken = (
  req: RequestWithBodyAndParams<any, any>,
  res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);
  if (!token) {
    return responseHandler(
      res,
      401,
      "No access token provided, authorization denied",
    );
  }
  try {
    const decode = decodeAccessToken(token);
    req.jwtPayload = decode;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return responseHandler(res, 401, "Access token expired");
    }
    next(error);
  }
};

export const verifyRefreshToken = (
  req: RequestWithToken,
  res: Response,
  next: NextFunction,
) => {
  const token = extractRefreshToken(req);
  if (!token) {
    return responseHandler(
      res,
      401,
      "No refresh token provided, authorization denied",
    );
  }
  try {
    const decode = decodeRefreshToken(token);
    req.jwtPayload = decode;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return responseHandler(res, 401, "Refresh token expired");
    }
    next(error);
  }
};
