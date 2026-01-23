import Joi from "joi";
import { RequestWithBody } from "../../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";

export const userUpdateSchema = Joi.object({
  userId: Joi.number().integer().required(),
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  roleId: Joi.number().integer().required(),
  mobilePhone: Joi.string().allow(null, "").optional(),
});

const validateUserUpdateScheme = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    const appError = new AppError(
      error.message,
      400,
      "User update payload is invalid. Check required fields and format.",
    );
    return next(appError);
  }
  next();
};

export default validateUserUpdateScheme;
