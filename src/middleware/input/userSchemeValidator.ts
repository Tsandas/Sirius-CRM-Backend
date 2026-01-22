import Joi from "joi";
import { RequestWithBody } from "../../types/requests";
import { User } from "../../types/PostgresDB/users";
import { NextFunction, Response } from "express";
import { AppError } from "../../Error/appError";

export const userSchema = Joi.object({
  firstName: Joi.string().min(1).required(), // first_name
  lastName: Joi.string().min(1).required(), // last_name
  username: Joi.string().min(3).required(), // username
  email: Joi.string().email().required(), // email
  passwordHash: Joi.string().min(3).required(), // password_hash
  mobilePhone: Joi.string().allow(null, "").optional(), // mobile_phone can be null
  roleId: Joi.number().integer().required(), // role_id
  status: Joi.string().valid("ONLINE", "OFFLINE").required(), // status
  isActive: Joi.boolean().required(), // is_active
});

const validateUserScheme = (
  req: RequestWithBody<User>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const appError = new AppError(
      error.message,
      400,
      "Users should follow the correct userSchema. Check the correct format.",
    );
    return next(appError);
  }
  next();
};

export default validateUserScheme;
