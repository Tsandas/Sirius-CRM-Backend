import Joi from "joi";
import { RequestWithBody } from "../../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";

export const updateTaskSchema = Joi.object({
  taskId: Joi.number().integer().required(),
  status: Joi.string().required(),
  subject: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  assignedToUserId: Joi.number().integer().optional().allow(null),
  priority: Joi.string().optional().allow(null),
  reminder: Joi.boolean().optional(),
  callDurationSeconds: Joi.number().integer().optional().allow(null),
  location: Joi.string().optional().allow(null),
});

export const validateUpdateTaskSchema = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = updateTaskSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    return next(
      new AppError(error.message, 400, "Update task payload is invalid."),
    );
  }

  next();
};
