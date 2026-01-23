import { responseHandler } from "../utils/responseHandler";
import { RequestWithBody } from "../types/requests";
import { NextFunction, Response } from "express";
import { InsertClientParams } from "../types/PostgresDB/trader-client";
import { insertClientService } from "../models/tradersModel";

export const insertClient = async (
  req: RequestWithBody<InsertClientParams>,
  res: Response,
  next: NextFunction,
) => {
  if (!req.jwtPayload?.userId) {
    return responseHandler(res, 401, "Unauthorized: user ID missing");
  }

  const client: InsertClientParams = {
    companyName: req.body.companyName,
    accountType: req.body.accountType ?? null,
    timNumber: req.body.timNumber,
    language: req.body.language ?? null,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    city: req.body.city ?? null,
    stateCountry: req.body.stateCountry ?? null,
    zipCode: req.body.zipCode ?? null,
    createdByUserId: Number(req.jwtPayload.userId),
  };

  const clientResult = await insertClientService(client);

  return responseHandler(
    res,
    200,
    "Client inserted successfully",
    clientResult,
  );
};
