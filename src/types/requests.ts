import { Request } from "express";
import { JWTPayload } from "./auth";
export type RequestWithBody<TBody, TParams = {}> = Request<
  TParams,
  {},
  TBody
> & {
  jwtPayload?: JWTPayload;
};
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

export type RequestWithBodyAndParams<TBody, TParams> = Request<
  TParams,
  {},
  TBody
> & {
  jwtPayload?: JWTPayload;
};
