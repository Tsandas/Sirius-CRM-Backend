import { responseHandler } from "../utils/responseHandler";
import { RequestWithBody } from "../types/requests";
import { NextFunction, Request, Response } from "express";
import {
  InsertClientParams,
  UpdateClientParams,
} from "../types/PostgresDB/trader-client";
import {
  deleteTraderService,
  getAllTradersService,
  insertClientService,
  updateTraderService,
} from "../models/tradersModel";

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

  try {
    const clientResult = await insertClientService(client);
    return responseHandler(
      res,
      200,
      "Client inserted successfully",
      clientResult,
    );
  } catch (error) {
    next(error);
  }
};

export const updateTrader = async (
  req: RequestWithBody<UpdateClientParams>,
  res: Response,
  next: NextFunction,
) => {
  const updatedTrader = await updateTraderService(req.body);
  return responseHandler(
    res,
    200,
    "Client updated successfully",
    updatedTrader,
  );
};

type TraderParams = { traderId: string };
export const deleteTrader = async (
  req: Request<TraderParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { traderId } = req.params;
    const deletedTrader = await deleteTraderService(Number(traderId));
    return responseHandler(
      res,
      200,
      "Trader deleted successfully",
      deletedTrader,
    );
  } catch (error) {
    next(error);
  }
};

export const getAllTraders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const traders = await getAllTradersService();
    return responseHandler(res, 200, "Traders retrieved successfully", traders);
  } catch (error) {
    next(error);
  }
};