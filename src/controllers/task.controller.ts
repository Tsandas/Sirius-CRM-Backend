import { NextFunction, Request, Response } from "express";
import { RequestWithBody } from "../types/requests";
import {
  InsertTaskParams,
  InsertTaskTypeParams,
  SetActiveTaskTypesParams,
  UpdateTaskParams,
} from "../types/PostgresDB/tasks";
import { responseHandler } from "../utils/responseHandler";
import {
  insertTaskService,
  insertTaskTypeService,
  setActiveTaskTypesService,
  updateTaskService,
} from "../models/taskModel";

export const insertTaskType = async (
  req: RequestWithBody<InsertTaskTypeParams>,
  res: Response,
  next: NextFunction,
) => {
  const task: InsertTaskTypeParams = {
    taskTypeId: req.body.taskTypeId,
    taskTypeName: req.body.taskTypeName,
    taskTypeCode: req.body.taskTypeCode,
    isActive: req.body.isActive ?? true,
  };

  try {
    const taskResult = await insertTaskTypeService(task);
    return responseHandler(res, 200, "Task inserted successfully", taskResult);
  } catch (error) {
    next(error);
  }
};

export const setActiveTaskTypes = async (
  req: RequestWithBody<SetActiveTaskTypesParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const taskResult = await setActiveTaskTypesService(req.body);
    return responseHandler(res, 200, "Task inserted successfully", taskResult);
  } catch (error) {
    next(error);
  }
};

export const insertTask = async (
  req: RequestWithBody<InsertTaskParams>,
  res: Response,
  next: NextFunction,
) => {
  if (!req.jwtPayload?.userId) {
    return responseHandler(res, 401, "Unauthorized: user ID missing");
  }

  const task: InsertTaskParams = {
    taskTypeId: req.body.taskTypeId,
    transactionId: req.body.transactionId,
    status: req.body.status,
    handledByUserId: Number(req.jwtPayload.userId),
    subject: req.body.subject,
    description: req.body.description,
    assignedToUserId: req.body.assignedToUserId ?? null,
    priority: req.body.priority ?? null,
    reminder: req.body.reminder ?? false,
    callDurationSeconds: req.body.callDurationSeconds ?? null,
    location: req.body.location ?? null,
    chainId: req.body.chainId ?? null,
  };
  try {
    const taskResult = await insertTaskService(task);
    return responseHandler(res, 200, "Task inserted successfully", taskResult);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: RequestWithBody<UpdateTaskParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await updateTaskService(req.body);

    return responseHandler(res, 200, "Task updated successfully", result);
  } catch (error) {
    next(error);
  }
};
