import express from "express";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";
import { validateInsertTaskTypeSchema } from "../middleware/input/tasks/insertTaskTypesSchemeValidator";
import {
  addTaskComment,
  filterTasks,
  getMyTasks,
  getMyTasksStats,
  getTaskComments,
  getUnassignedTasks,
  getUnassignedTasksStats,
  insertTask,
  insertTaskType,
  searchClientsForTaskForm,
  searchMyTasks,
  searchTasks,
  searchUnassignedTasks,
  setActiveTaskTypes,
  updateTask,
} from "../controllers/task.controller";
import { validateSetActiveTaskTypesSchema } from "../middleware/input/tasks/setActiveTasksSchemeValidator";
import { validateInsertTaskSchema } from "../middleware/input/tasks/insertTaskSchemeValidator";
import { validateUpdateTaskSchema } from "../middleware/input/tasks/updateTaskSchemeValidator";
import { validateInsertTaskCommentSchema } from "../middleware/input/tasks/addTaskCommentSchemeValidator";

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
router.put("/", verifyAccessToken, validateUpdateTaskSchema, updateTask);
router.post(
  "/:id/comments",
  verifyAccessToken,
  validateInsertTaskCommentSchema,
  addTaskComment,
);
router.get("/:id/comments", verifyAccessToken, getTaskComments);
router.get("/unassigned", verifyAccessToken, getUnassignedTasks);
router.get("/unassigned/stats", verifyAccessToken, getUnassignedTasksStats);
router.get("/my", verifyAccessToken, getMyTasks);
router.get("/my/stats", verifyAccessToken, getMyTasksStats);
router.get("/filter", verifyAccessToken, filterTasks);
router.get("/search", verifyAccessToken, searchTasks);
router.get("/search/unassigned", verifyAccessToken, searchUnassignedTasks);
router.get("/search/my", verifyAccessToken, searchMyTasks);
router.get(
  "/clients/search-for-task",
  verifyAccessToken,
  searchClientsForTaskForm,
);

export default router;
