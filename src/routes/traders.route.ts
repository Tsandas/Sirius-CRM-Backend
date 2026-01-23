import express from "express";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";
import validateInsertClientSchema from "../middleware/input/clientTraderSchemeValidator";
import { insertClient } from "../controllers/traders.controller";

const router = express.Router();

router.post(
  "/insert-client",
  verifyAccessToken,
  validateInsertClientSchema,
  insertClient,
);

export default router;
