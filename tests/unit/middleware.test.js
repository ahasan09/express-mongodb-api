const mongoose = require("mongoose");
const { User } = require("../../models/user");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe("auth middleware", () => {
  it("populates req.user with the decoded token payload", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      name: "John Smith",
      email: "john@example.com",
      isAdmin: false
    };
    const token = new User(payload).generateAuthToken();

    const req = { header: jest.fn().mockReturnValue(token) };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(payload);
  });

  it("returns 401 when no token is provided", () => {
    const req = { header: jest.fn().mockReturnValue(undefined) };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when the token is invalid", () => {
    const req = { header: jest.fn().mockReturnValue("not-a-valid-token") };
    const res = mockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("admin middleware", () => {
  it("calls next for an admin user", () => {
    const req = { user: { isAdmin: true } };
    const res = mockRes();
    const next = jest.fn();

    admin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 403 for a non-admin user", () => {
    const req = { user: { isAdmin: false } };
    const res = mockRes();
    const next = jest.fn();

    admin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
