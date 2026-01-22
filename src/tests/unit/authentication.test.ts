jest.mock("../../utils/responseHandler", () => ({
  responseHandler: jest.fn(),
}));
jest.mock("../../models/authenticationModels", () => ({
  loginService: jest.fn(),
}));
const redisGetMock = jest.fn();
jest.mock("../../config/redis", () => ({
  redisGetKey: redisGetMock,
}));
jest.mock("../../utils/Authorization/retrieveTokenFromRequest", () => ({
  extractRefreshToken: jest.fn(),
}));
jest.mock("../../utils/Authentication/generateTokens", () => ({
  generateAccessToken: jest.fn(),
}));

import { responseHandler } from "../../utils/responseHandler";
import { loginService } from "../../models/authenticationModels";
import {
  authenticationLogin,
  refreshToken,
} from "../../controllers/authentication.controller";
import { extractRefreshToken } from "../../utils/Authorization/retrieveTokenFromRequest";
import { generateAccessToken } from "../../utils/Authentication/generateTokens";

describe("Login", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { body: { username: "giorgos", password: "12345678" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    (responseHandler as jest.Mock).mockClear();
    (loginService as jest.Mock).mockClear();
  });

  it("returns 404 when agent enters invalid credentials", async () => {
    (loginService as jest.Mock).mockResolvedValue(null);
    await authenticationLogin(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      401,
      "Invalid username or password",
      null
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 200 when agent enters valid credentials", async () => {
    const fakeUser = { agentId: 1, username: "giorgos" };
    (loginService as jest.Mock).mockResolvedValue(fakeUser);
    await authenticationLogin(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      200,
      "Log in successful",
      fakeUser
    );
    expect(next).not.toHaveBeenCalled();
  });

  // it("calls next(error) when an exception occurs", async () => {
  //   const error = new Error("Database error");
  //   (loginService as jest.Mock).mockRejectedValue(error);
  //   await authenticationLogin(req, res, next);
  //   expect(next).toHaveBeenCalledWith(error);
  // });

});

describe("Refresh Access Token", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      jwtPayload: { username: "giorgos" },
      headers: {},
      cookies: {},
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    jest.clearAllMocks();
  });

  it("returns 401 when jwtPayload is missing", async () => {
    req.jwtPayload = null;
    await refreshToken(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      401,
      "Unauthorized: missing or invalid access token"
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when refresh token does not match stored token", async () => {
    redisGetMock.mockResolvedValue("storedToken");
    (extractRefreshToken as jest.Mock).mockReturnValue("differentToken");
    await refreshToken(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      401,
      "Invalid refresh token provided"
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 200 and new access token when refresh token is valid", async () => {
    redisGetMock.mockResolvedValue("storedToken");
    (extractRefreshToken as jest.Mock).mockReturnValue("storedToken");
    (generateAccessToken as jest.Mock).mockReturnValue("newAccessToken");
    await refreshToken(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      200,
      "Access token refreshed successfully",
      { accessToken: "newAccessToken" }
    );
    expect(next).not.toHaveBeenCalled();
  });
});
