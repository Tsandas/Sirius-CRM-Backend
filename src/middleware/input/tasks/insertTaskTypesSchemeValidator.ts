import Joi from "joi";
import { RequestWithBody } from "../../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";

export const insertTaskTypeSchema = Joi.object({
  taskTypeId: Joi.number().integer().required(),
  taskTypeName: Joi.string().min(1).required(),
  taskTypeCode: Joi.string().min(1).required(),
  isActive: Joi.boolean().optional(),
});

export const validateInsertTaskTypeSchema = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = insertTaskTypeSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    return next(
      new AppError(
        error.message,
        400,
        "Insert task type payload is invalid. Check required fields and format.",
      ),
    );
  }

  next();
};
