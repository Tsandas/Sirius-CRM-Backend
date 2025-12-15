import { Request, Response, NextFunction } from "express";
import { AppError } from "../../Error/appError";
import { getEnvVar } from "../../utils/getEnvVar";

const errorHandling = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error =
    err instanceof AppError
      ? err
      : new AppError(err.message, 500, "Internal Server Error");

  const responseMessage =
    process.env.ENVIRONMENT !== "PROD"
      ? error.customMessage
      : "Internal Server Error";
  if (getEnvVar("SHOW_LOGS") !== "false") {
    console.error("Error: ", err);
  }
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: responseMessage,
      details: process.env.ENVIRONMENT !== "PROD" ? err.stack : undefined,
    },
    meta: {
      status: error.statusCode,
    },
  });
};

export default errorHandling;
