import { NextFunction, Request, Response } from "express";
import {
  RequestWithBody,
  RequestWithBodyAndParams,
  TypedRequest,
} from "../types/requests";
import {
  AddTaskCommentParams,
  InsertTaskParams,
  InsertTaskTypeParams,
  SetActiveTaskTypesParams,
  UpdateTaskParams,
} from "../types/PostgresDB/tasks";
import { responseHandler } from "../utils/responseHandler";
import {
  addTaskCommentService,
  filterTasksService,
  getMyTasksService,
  getTaskCommentsService,
  getUnassignedTasksService,
  insertTaskService,
  insertTaskTypeService,
  searchTasksService,
  setActiveTaskTypesService,
  updateTaskService,
} from "../models/taskModel";
import {
  mapFilteredTaskRow,
  mapMyTaskRow,
  mapUnassignedTaskRow,
} from "../utils/Mapping/mapTasks";
import { SearchTaskSearchParams } from "../middleware/input/tasks/searchTasksQueryValidator";

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

interface TaskIdParams {
  id: string;
}
export const addTaskComment = async (
  req: RequestWithBodyAndParams<{ comment: string }, TaskIdParams>,
  res: Response,
  next: NextFunction,
) => {
  if (!req.jwtPayload?.userId) {
    return responseHandler(res, 401, "Unauthorized: user ID missing");
  }
  const taskComment: AddTaskCommentParams = {
    taskId: Number(req.params.id),
    userId: Number(req.jwtPayload.userId),
    comment: req.body.comment,
  };
  try {
    const commentId = await addTaskCommentService(taskComment);
    return responseHandler(res, 201, "Comment added successfully", {
      commentId,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskComments = async (
  req: RequestWithBodyAndParams<{ comment: string }, TaskIdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const comments = await getTaskCommentsService(Number(req.params.id));
    return responseHandler(res, 200, "Comment fetched successfully", {
      comments,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnassignedTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await getUnassignedTasksService();
    const tasks = rows.map(mapUnassignedTaskRow);

    return responseHandler(res, 200, "Unassigned tasks fetched successfully", {
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyTasks = async (
  req: RequestWithBodyAndParams<any, any>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.jwtPayload?.userId) {
      return responseHandler(res, 401, "Unauthorized");
    }

    const userId = Number(req.jwtPayload.userId);
    const rows = await getMyTasksService(userId);
    const tasks = rows.map(mapMyTaskRow);

    return responseHandler(res, 200, "My tasks fetched successfully", {
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

export interface FilterTasksQuery {
  taskId?: string;
  taskTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: string;
  status?: string;

  clientCodePrefix?: string;
  clientNamePrefix?: string;
  clientTimPrefix?: string;
  clientEmailPrefix?: string;
}
export const filterTasks = async (
  req: TypedRequest<{}, {}, FilterTasksQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query;

    const params = {
      taskId: q.taskId ? Number(q.taskId) : null,
      taskTypeId: q.taskTypeId ? Number(q.taskTypeId) : null,
      dateFrom: q.dateFrom ?? null,
      dateTo: q.dateTo ?? null,
      priority: q.priority ?? null,
      status: q.status ?? null,

      clientCodePrefix: q.clientCodePrefix ?? null,
      clientNamePrefix: q.clientNamePrefix ?? null,
      clientTimPrefix: q.clientTimPrefix ?? null,
      clientEmailPrefix: q.clientEmailPrefix ?? null,
    };

    const rows = await filterTasksService(params);
    const tasks = rows.map(mapFilteredTaskRow);

    return responseHandler(res, 200, "Tasks filtered successfully", { tasks });
  } catch (err) {
    next(err);
  }
};

export const searchTasks = async (
  req: RequestWithBodyAndParams<any, any>,
  res: Response,
  next: NextFunction,
) => {
  if (!req.jwtPayload?.userId) {
    return responseHandler(res, 401, "Unauthorized");
  }
  try {
    const userId = req.jwtPayload?.userId;
    const tasks = await searchTasksService(
      req.query as SearchTaskSearchParams,
      Number(userId),
    );

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Tasks fetched successfully",
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};
