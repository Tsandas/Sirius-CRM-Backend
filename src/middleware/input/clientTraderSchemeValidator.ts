import Joi from "joi";
import { RequestWithBody } from "../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../Error/appError";

export const insertClientSchema = Joi.object({
  companyName: Joi.string().min(1).required(),
  accountType: Joi.string().allow(null, "").optional(),
  timNumber: Joi.string().min(1).required(),
  language: Joi.string().allow(null, "").optional(),
  phone: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  address: Joi.string().min(1).required(),
  city: Joi.string().allow(null, "").optional(),
  stateCountry: Joi.string().allow(null, "").optional(),
  zipCode: Joi.string().allow(null, "").optional(),
});

const validateInsertClientSchema = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = insertClientSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    const appError = new AppError(
      error.message,
      400,
      "Insert client payload is invalid. Check required fields and format.",
    );
    return next(appError);
  }

  next();
};

export default validateInsertClientSchema;
