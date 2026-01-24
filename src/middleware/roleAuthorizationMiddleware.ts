import { NextFunction, Response } from "express";
import { RequestWithToken } from "../types/requests";

export const authorizeRole = (...allowedRoles: number[]) => {
  return (req: RequestWithToken, res: Response, next: NextFunction) => {
    if (!req.jwtPayload) {
      return res.status(401).json({ message: "Unauthorized, no JWTPayload" });
    }
    console.log("User role:", req.jwtPayload.roleId);
    console.log("Allowed roles:", allowedRoles);
    if (!allowedRoles.includes(Number(req.jwtPayload?.roleId))) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
