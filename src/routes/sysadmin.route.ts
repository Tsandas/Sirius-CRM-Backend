import express from "express";
import { responseHandler } from "../utils/responseHandler";
import { authRegister } from "../controllers/sysadmin.controller";
import { verifyAdminToken } from "../middleware/sysadminMiddleware";
import validateUserScheme from "../middleware/input/userSchemeValidator";

const router = express.Router();
router.post("/register", verifyAdminToken, validateUserScheme, authRegister);
router.delete("/delete", (req, res) => {
  console.log(req.body);
  return responseHandler(res, 200, "Sysadmin delete endpoint");
});

export default router;
