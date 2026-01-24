import express, { NextFunction, Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import { verifyAccessToken } from "../middleware/authorizationMiddleware";
import { authorizeRole } from "../middleware/roleAuthorizationMiddleware";
import { AppError } from "../Error/appError";
const router = express.Router();

// Everyone can access
router.get("/sayHello", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

router.get("/throwError", (req: Request, res: Response, next: NextFunction) => {
  try {
    throw new AppError("This is a test error", 500, "Custom message for error");
  } catch (error) {
    next(error);
  }
});

router.get("/getUsers", (req: Request, res: Response) => {
  const users = [];
  for (let i = 1; i <= 100; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      role: "member",
    });
  }
  return responseHandler(res, 200, "Users Fetched", users);
});

router.get("/getUsersAuth", (req: Request, res: Response) => {
  if (req.headers.authorization === "123") {
    const users = [];
    for (let i = 1; i <= 100; i++) {
      users.push({
        id: i,
        name: `User ${i}`,
        role: "member",
      });
    }
    return responseHandler(res, 200, "Users Fetched", users);
  } else {
    return responseHandler(
      res,
      401,
      "Include in your Headers.authorization the token",
    );
  }
});

router.post("/pushDataAuth", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    if (!token) {
      return responseHandler(
        res,
        401,
        "Include the correct token in Headers.authorization",
      );
    }
  }

  if (token != "123") {
    return responseHandler(res, 401, "Not correct");
  } else {
    return responseHandler(res, 200, "Ok", req.body);
  }
});

router.post("/pushData", (req: Request, res: Response) => {
  return responseHandler(res, 200, "Post request received", req.body);
});

// Admin only
router.get(
  "/admin",
  verifyAccessToken,
  authorizeRole(1),
  (req: Request, res: Response) => {
    res.json({ message: "Admin" });
  },
);

// Admin Manager
router.get(
  "/manager",
  verifyAccessToken,
  authorizeRole(1, 2),
  (req: Request, res: Response) => {
    res.json({ message: "Manager" });
  },
);

// Admin Manager User
router.get(
  "/user",
  verifyAccessToken,
  authorizeRole(1, 2, 3),
  (req: Request, res: Response) => {
    res.json({ message: "User" });
  },
);

export default router;
