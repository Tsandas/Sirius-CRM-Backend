import Joi from "joi";
import { RequestWithBody } from "../../../types/requests";
import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";

const insertTaskCommentSchema = Joi.object({
  comment: Joi.string().trim().min(1).required(),
});

export const validateInsertTaskCommentSchema = (
  req: RequestWithBody<any>,
  res: Response,
  next: NextFunction,
) => {
  const { error } = insertTaskCommentSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    const appError = new AppError(
      error.message,
      400,
      "Insert task comment payload is invalid. Check required fields and format.",
    );
    return next(appError);
  }

  next();
};
