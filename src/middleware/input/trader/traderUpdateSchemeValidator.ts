import Joi from "joi";
import { RequestWithBody } from "../../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";

export const traderUpdateSchema = Joi.object({
  traderId: Joi.number().integer().required(),

  companyName: Joi.string().trim().min(1).required(),
  timNumber: Joi.string().trim().min(1).required(),
  phone: Joi.string().trim().min(1).required(),
  email: Joi.string().email().trim().required(),

  address: Joi.string().min(1).required(),

  city: Joi.string().trim().allow(null, "").optional(),
  stateCountry: Joi.string().trim().allow(null, "").optional(),
  zipCode: Joi.string().trim().allow(null, "").optional(),

  language: Joi.string().trim().allow(null, "").optional(),
  accountType: Joi.string().trim().allow(null, "").optional(),

  status: Joi.boolean().optional(),
});

const validateTraderUpdateSchema = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = traderUpdateSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return next(
      new AppError(
        error.message,
        400,
        "Trader update payload is invalid. Check required fields and formats.",
      ),
    );
  }
  next();
};

export default validateTraderUpdateSchema;
