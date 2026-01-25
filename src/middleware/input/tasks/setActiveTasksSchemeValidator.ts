import Joi from "joi";
import { RequestWithBody } from "../../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";

export const setActiveTaskTypesSchema = Joi.object({
  activeTaskTypeIds: Joi.array()
    .items(Joi.number().integer())
    .allow(null)
    .required(),
});

export const validateSetActiveTaskTypesSchema = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = setActiveTaskTypesSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    return next(
      new AppError(
        error.message,
        400,
        "Active task type IDs payload is invalid.",
      ),
    );
  }

  next();
};
