jest.mock("../../models/sysadminModel", () => ({
  userExistsService: jest.fn(),
}));
jest.mock("../../utils/responseHandler", () => ({
  responseHandler: jest.fn(),
}));
import { authRegister } from "../../controllers/sysadmin.controller";
import { responseHandler } from "../../utils/responseHandler";
import { userExistsService } from "../../models/sysadminModel";
describe("authRegister", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { body: { userId: "123", username: "john" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    (responseHandler as jest.Mock).mockClear();
  });

  it("returns 409 when user already exists", async () => {
    (userExistsService as jest.Mock).mockResolvedValue(true);
    await authRegister(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      409,
      "User with this userId or username already exists",
    );
    expect(next).not.toHaveBeenCalled();
  });

  // it("returns 200 when user does not exist", async () => {
  //   (userExistsService as jest.Mock).mockResolvedValue(false);
  //   await authRegister(req, res, next);
  //   expect(responseHandler).toHaveBeenCalledWith(
  //     res,
  //     200,
  //     "User is valid",
  //     req.body,
  //   );
  //   expect(next).not.toHaveBeenCalled();
  // });

  it("calls next on error", async () => {
    const err = new Error("Database error");
    (userExistsService as jest.Mock).mockRejectedValue(err);
    await authRegister(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
