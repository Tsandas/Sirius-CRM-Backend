import express from "express";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";
import validateInsertClientSchema from "../middleware/input/trader/clientTraderSchemeValidator";
import {
  deleteTrader,
  filterClients,
  filterClientsForm,
  getAllTraders,
  getTradersStats,
  insertClient,
  updateTrader,
} from "../controllers/traders.controller";
import validateTraderUpdateSchema from "../middleware/input/trader/traderUpdateSchemeValidator";

const router = express.Router();

router.get("/traders", verifyAccessToken, getAllTraders);
router.get("/traders/stats", verifyAccessToken, getTradersStats);
router.get("/traders/search", verifyAccessToken, filterClients);
router.get("/traders/filter", verifyAccessToken, filterClientsForm);
router.post(
  "/traders",
  verifyAccessToken,
  validateInsertClientSchema,
  insertClient,
);
router.put(
  "/traders",
  verifyAccessToken,
  validateTraderUpdateSchema,
  updateTrader,
);
router.delete("/traders/:traderId", verifyAccessToken, deleteTrader);

export default router;
