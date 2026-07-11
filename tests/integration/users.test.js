const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const app = require("../../app");
const db = require("../db");
const { User } = require("../../models/user");

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

const validPayload = () => ({
  name: "John Smith",
  email: "john@example.com",
  password: "abc123"
});

describe("POST /api/users", () => {
  it("registers a new user and returns it without the password", async () => {
    const res = await request(app)
      .post("/api/users")
      .send(validPayload());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: "John Smith",
      email: "john@example.com"
    });
    expect(res.body).toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("password");
  });

  it("returns a valid auth token in the x-auth-token header", async () => {
    const res = await request(app)
      .post("/api/users")
      .send(validPayload());

    const decoded = jwt.verify(
      res.headers["x-auth-token"],
      config.get("jwtPrivateKey")
    );
    expect(decoded).toMatchObject({
      name: "John Smith",
      email: "john@example.com"
    });
  });

  it("stores the password hashed, not in plain text", async () => {
    await request(app)
      .post("/api/users")
      .send(validPayload());

    const user = await User.findOne({ email: "john@example.com" });
    expect(user.password).not.toBe("abc123");
    await expect(bcrypt.compare("abc123", user.password)).resolves.toBe(true);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ ...validPayload(), email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the email is already registered", async () => {
    await request(app)
      .post("/api/users")
      .send(validPayload());

    const res = await request(app)
      .post("/api/users")
      .send(validPayload());

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/already registered/i);
  });
});

describe("GET /api/users/me", () => {
  it("returns the current user without the password", async () => {
    const registration = await request(app)
      .post("/api/users")
      .send(validPayload());
    const token = registration.headers["x-auth-token"];

    const res = await request(app)
      .get("/api/users/me")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: "John Smith",
      email: "john@example.com"
    });
    expect(res.body).not.toHaveProperty("password");
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });
});
