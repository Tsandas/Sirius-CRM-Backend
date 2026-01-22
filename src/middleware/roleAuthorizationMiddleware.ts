import { NextFunction, Response } from "express";
import { RequestWithToken } from "../types/requests";

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: RequestWithToken, res: Response, next: NextFunction) => {
    if (!req.jwtPayload) {
      return res.status(401).json({ message: "Unauthorized, no JWTPayload" });
    }
    if (!allowedRoles.includes(req.jwtPayload?.roleId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
