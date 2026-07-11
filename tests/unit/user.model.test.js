const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const { User, validate } = require("../../models/user");

describe("User.generateAuthToken", () => {
  it("returns a valid JWT signed with jwtPrivateKey", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId(),
      name: "John Smith",
      email: "john@example.com",
      isAdmin: true
    };
    const user = new User(payload);

    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    expect(decoded).toMatchObject({
      _id: payload._id.toHexString(),
      name: payload.name,
      email: payload.email,
      isAdmin: true
    });
  });

  it("produces a token that fails verification with a different key", () => {
    const user = new User({
      name: "John Smith",
      email: "john@example.com",
      password: "12345"
    });

    const token = user.generateAuthToken();

    expect(() => jwt.verify(token, "some-other-key")).toThrow();
  });
});

describe("validate (user Joi schema)", () => {
  const validUser = () => ({
    name: "John Smith",
    email: "john@example.com",
    password: "abc123"
  });

  it("accepts a valid user", () => {
    const { error } = validate(validUser());
    expect(error).toBeUndefined();
  });

  it("rejects a name shorter than 5 characters", () => {
    const user = { ...validUser(), name: "Jon" };
    const { error } = validate(user);
    expect(error.details[0].path).toContain("name");
  });

  it("rejects an invalid email", () => {
    const user = { ...validUser(), email: "not-an-email" };
    const { error } = validate(user);
    expect(error.details[0].path).toContain("email");
  });

  it("rejects a password with non-alphanumeric characters", () => {
    const user = { ...validUser(), password: "abc!@#123" };
    const { error } = validate(user);
    expect(error.details[0].path).toContain("password");
  });

  it("rejects a missing password", () => {
    const user = validUser();
    delete user.password;
    const { error } = validate(user);
    expect(error.details[0].path).toContain("password");
  });
});
