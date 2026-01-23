import { responseHandler } from "../utils/responseHandler";
import { RequestWithBody } from "../types/requests";
import { User } from "../types/PostgresDB/users";
import {
  userExistsService,
  createUserService,
  updateUserService,
  deleteUserService,
} from "../models/sysadminModel";
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
    createUserService(req.body);
    return responseHandler(res, 200, "User is valid", req.body);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: RequestWithBody<User>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await updateUserService(req.body); // boolean
    if (!updated) {
      return responseHandler(res, 404, "User not found or inactive");
    }
    return responseHandler(res, 200, "User updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: RequestWithBody<{ userId: number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.body;
    const deleted = await deleteUserService(userId);
    if (!deleted) {
      return responseHandler(res, 404, "User not found or already deleted");
    }
    return responseHandler(res, 200, "User deleted successfully");
  } catch (err) {
    next(err);
  }
};