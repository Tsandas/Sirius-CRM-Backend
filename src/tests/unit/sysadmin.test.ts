jest.mock("../../models/sysadminModel", () => ({
  agentExistsService: jest.fn(),
}));
jest.mock("../../utils/responseHandler", () => ({
  responseHandler: jest.fn(),
}));
import { authRegister } from "../../controllers/sysadmin.controller";
import { responseHandler } from "../../utils/responseHandler";
import { agentExistsService } from "../../models/sysadminModel";
describe("authRegister", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { body: { agentId: "123", username: "john" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    (responseHandler as jest.Mock).mockClear();
  });

  it("returns 409 when agent already exists", async () => {
    (agentExistsService as jest.Mock).mockResolvedValue(true);
    await authRegister(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      409,
      "Agent with this agentId or username already exists"
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 200 when agent does not exist", async () => {
    (agentExistsService as jest.Mock).mockResolvedValue(false);
    await authRegister(req, res, next);
    expect(responseHandler).toHaveBeenCalledWith(
      res,
      200,
      "Agent is valid (Agent won't be created for now)",
      req.body
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next on error", async () => {
    const err = new Error("Database error");
    (agentExistsService as jest.Mock).mockRejectedValue(err);
    await authRegister(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

});
