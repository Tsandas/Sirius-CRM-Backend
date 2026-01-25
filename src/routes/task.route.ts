import express from "express";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";
import { validateInsertTaskTypeSchema } from "../middleware/input/tasks/insertTaskTypesSchemeValidator";
import {
  insertTask,
  insertTaskType,
  setActiveTaskTypes,
} from "../controllers/task.controller";
import { validateSetActiveTaskTypesSchema } from "../middleware/input/tasks/setActiveTasksSchemeValidator";
import { validateInsertTaskSchema } from "../middleware/input/tasks/insertTaskSchemeValidator";

const router = express.Router();
router.post(
  "/types",
  verifyAccessToken,
  validateInsertTaskTypeSchema,
  insertTaskType,
);
// SQL function not working
router.post(
  "/active",
  verifyAccessToken,
  validateSetActiveTaskTypesSchema,
  setActiveTaskTypes,
);
router.post("/", verifyAccessToken, validateInsertTaskSchema, insertTask);

export default router;
