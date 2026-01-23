import { Request } from "express";
import { JWTPayload } from "./auth";
export type RequestWithBody<T> = Request<{}, {}, T> & { jwtPayload?: JWTPayload };
export type TypedRequest<Body = {}, Params = {}, Query = {}> = Request<
  Params,
  {},
  Body,
  Query
>;

export interface RequestWithToken extends Request {
  jwtPayload?: JWTPayload;
  accessToken?: string;
  refreshToken?: string;
}
