const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");
const app = require("../../app");
const db = require("../db");

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

const credentials = { email: "john@example.com", password: "abc123" };

async function registerUser() {
  await request(app)
    .post("/api/users")
    .send({ name: "John Smith", ...credentials });
}

describe("POST /api/auth", () => {
  it("returns a valid JWT for correct credentials", async () => {
    await registerUser();

    const res = await request(app)
      .post("/api/auth")
      .send(credentials);

    expect(res.status).toBe(200);
    const decoded = jwt.verify(res.text, config.get("jwtPrivateKey"));
    expect(decoded).toMatchObject({
      name: "John Smith",
      email: credentials.email
    });
  });

  it("returns 400 for a wrong password", async () => {
    await registerUser();

    const res = await request(app)
      .post("/api/auth")
      .send({ ...credentials, password: "wrong123" });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/invalid email or password/i);
  });

  it("returns 400 for an unknown email", async () => {
    const res = await request(app)
      .post("/api/auth")
      .send({ ...credentials, email: "nobody@example.com" });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/invalid email or password/i);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app)
      .post("/api/auth")
      .send({ email: "not-an-email", password: "abc123" });

    expect(res.status).toBe(400);
  });
});
