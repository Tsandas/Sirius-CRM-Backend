import express from "express";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";
import validateInsertClientSchema from "../middleware/input/trader/clientTraderSchemeValidator";
import {
  deleteTrader,
  getAllTraders,
  insertClient,
  updateTrader,
} from "../controllers/traders.controller";
import validateTraderUpdateSchema from "../middleware/input/trader/traderUpdateSchemeValidator";

const router = express.Router();

router.get("/get-traders", verifyAccessToken, getAllTraders);
router.post(
  "/insert-client",
  verifyAccessToken,
  validateInsertClientSchema,
  insertClient,
);
router.put(
  "/update-trader",
  verifyAccessToken,
  validateTraderUpdateSchema,
  updateTrader,
);
router.delete("/delete-trader/:traderId", verifyAccessToken, deleteTrader);

export default router;
