import { NextFunction, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import { RequestWithToken, TypedRequest } from "../types/requests";
import { LoginBody } from "../types/auth";
import { loginService } from "../models/authenticationModels";
import { redisGetKey } from "../config/redis";
import { generateAccessToken } from "../utils/Authentication/generateTokens";
import { extractRefreshToken } from "../utils/Authorization/retrieveTokenFromRequest";

export const authenticationLogin = async (
  req: TypedRequest<LoginBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    const logInStatus = await loginService(username, password);
    if (!logInStatus) {
      return responseHandler(res, 401, "Invalid username or password", null);
    }
    return responseHandler(res, 200, "Log in successful", logInStatus);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: RequestWithToken,
  res: Response,
  next: NextFunction
) => {
  try {
    // req.jwtPayload has been set in the verifyRefreshToken middleware
    if (!req.jwtPayload) {
      return responseHandler(
        res,
        401,
        "Unauthorized: missing or invalid access token"
      );
    }
    const storedToken = await redisGetKey(
      `refresh_token:${req.jwtPayload.username}`
    );
    if (storedToken !== extractRefreshToken(req)) {
      return responseHandler(res, 401, "Invalid refresh token provided");
    }
    const accessToken = generateAccessToken(req.jwtPayload);
    return responseHandler(res, 200, "Access token refreshed successfully", {
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};
