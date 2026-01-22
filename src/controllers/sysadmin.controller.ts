import { responseHandler } from "../utils/responseHandler";
import { RequestWithBody } from "../types/requests";
import { User } from "../types/PostgresDB/users";
import { userExistsService, createUserService } from "../models/sysadminModel";
import { NextFunction, Response } from "express";

export const authRegister = async (
  req: RequestWithBody<User>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, username } = req.body;
    const userExists = await userExistsService(userId, username);
    if (userExists) {
      return responseHandler(
        res,
        409,
        "User with this userId or username already exists",
      );
    }
    // create user
    createUserService(req.body);
    return responseHandler(res, 200, "User is valid", req.body);
  } catch (error) {
    next(error);
  }
};
