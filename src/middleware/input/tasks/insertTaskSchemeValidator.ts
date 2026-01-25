import Joi from "joi";
import { RequestWithBody } from "../../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";

export const insertTaskSchema = Joi.object({
  taskTypeId: Joi.number().integer().required(),
  transactionId: Joi.number().integer().required(),
  status: Joi.string().required(),
  subject: Joi.string().required(),
  description: Joi.string().required(),
  assignedToUserId: Joi.number().integer().optional().allow(null),
  priority: Joi.string().optional().allow(null),
  reminder: Joi.boolean().optional(),
  callDurationSeconds: Joi.number().integer().optional().allow(null),
  location: Joi.string().optional().allow(null),
  chainId: Joi.number().integer().optional().allow(null),
});

export const validateInsertTaskSchema = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = insertTaskSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    const appError = new AppError(
      error.message,
      400,
      "Insert task payload is invalid. Check required fields and format.",
    );
    return next(appError);
  }

  next();
};
