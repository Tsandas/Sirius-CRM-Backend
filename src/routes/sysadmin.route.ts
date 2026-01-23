import express from "express";
import { authRegister, deleteUser, updateUser } from "../controllers/sysadmin.controller";
import { verifyAdminToken } from "../middleware/sysadminMiddleware";
import validateUserScheme from "../middleware/input/user/userSchemeValidator";
import validateUserUpdateScheme from "../middleware/input/user/updateUserSchemeValidator";

const router = express.Router();
router.post("/register", verifyAdminToken, validateUserScheme, authRegister);
router.put("/update", verifyAdminToken, validateUserUpdateScheme, updateUser);
router.delete("/delete", verifyAdminToken, deleteUser); 
export default router;
