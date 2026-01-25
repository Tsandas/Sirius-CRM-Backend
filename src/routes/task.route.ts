import express from "express";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";

const router = express.Router();
router.get("/", verifyAccessToken, (req, res) => {});

export default router;