import express from "express";
import validateAgentScheme from "../middleware/input/agentSchemeValidator";
import { responseHandler } from "../utils/responseHandler";
import { authRegister } from "../controllers/sysadmin.controller";
import { verifyAdminToken } from "../middleware/sysadminMiddleware";

const router = express.Router();
router.post("/register", verifyAdminToken, validateAgentScheme, authRegister);
router.delete("/delete", (req, res) => {
  console.log(req.body);
  return responseHandler(res, 200, "Sysadmin delete endpoint");
});

export default router;
