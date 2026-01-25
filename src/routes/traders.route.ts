import express from "express";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";
import validateInsertClientSchema from "../middleware/input/trader/clientTraderSchemeValidator";
import validateTraderUpdateSchema from "../middleware/input/trader/traderUpdateSchemeValidator";
import {
  deleteTrader,
  filterClients,
  filterClientsForm,
  getAllTraders,
  getTradersStats,
  insertClient,
  updateTrader,
} from "../controllers/traders.controller";

const router = express.Router();

router.get("/", verifyAccessToken, getAllTraders);
router.get("/stats", verifyAccessToken, getTradersStats);
router.get("/search", verifyAccessToken, filterClients);
router.get("/filter", verifyAccessToken, filterClientsForm);
router.post("/", verifyAccessToken, validateInsertClientSchema, insertClient);
router.put("/", verifyAccessToken, validateTraderUpdateSchema, updateTrader);
router.delete("/:traderId", verifyAccessToken, deleteTrader);

export default router;
