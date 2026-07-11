const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const db = require("../db");
const { Customer } = require("../../models/customer");
const { User } = require("../../models/user");

let token;
let adminToken;

beforeAll(async () => {
  await db.connect();
  token = new User({
    name: "Plain User",
    email: "user@example.com",
    isAdmin: false
  }).generateAuthToken();
  adminToken = new User({
    name: "Admin User",
    email: "admin@example.com",
    isAdmin: true
  }).generateAuthToken();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

const validCustomer = () => ({
  firstname: "John",
  lastname: "doe",
  age: 30,
  gender: "Male",
  income: 50000,
  tags: ["regular"]
});

async function createCustomer(overrides = {}) {
  return new Customer({ ...validCustomer(), ...overrides }).save();
}

describe("auth protection", () => {
  it.each([
    ["get", "/api/customers"],
    ["get", `/api/customers/${new mongoose.Types.ObjectId()}`],
    ["post", "/api/customers"],
    ["put", `/api/customers/${new mongoose.Types.ObjectId()}`],
    ["delete", `/api/customers/${new mongoose.Types.ObjectId()}`]
  ])("returns 401 for %s %s without a token", async (method, url) => {
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid token", async () => {
    const res = await request(app)
      .get("/api/customers")
      .set("x-auth-token", "not-a-valid-token");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/customers", () => {
  it("returns the stored customers", async () => {
    await createCustomer();
    await createCustomer({ firstname: "Jane", gender: "Female" });

    const res = await request(app)
      .get("/api/customers")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const firstnames = res.body.map(c => c.firstname);
    expect(firstnames).toEqual(expect.arrayContaining(["John", "Jane"]));
  });
});

describe("GET /api/customers/:id", () => {
  it("returns the customer with the given id", async () => {
    const customer = await createCustomer();

    const res = await request(app)
      .get(`/api/customers/${customer._id}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ firstname: "John", lastname: "doe" });
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .get(`/api/customers/${new mongoose.Types.ObjectId()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/customers", () => {
  it("creates a customer and persists it", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("x-auth-token", token)
      .send(validCustomer());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ firstname: "John", income: 50000 });

    const saved = await Customer.findById(res.body._id);
    expect(saved).not.toBeNull();
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("x-auth-token", token)
      .send({ ...validCustomer(), gender: "Unknown" });

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/customers/:id", () => {
  it("updates an existing customer", async () => {
    const customer = await createCustomer();

    const res = await request(app)
      .put(`/api/customers/${customer._id}`)
      .set("x-auth-token", token)
      .send({ ...validCustomer(), firstname: "Johnny" });

    expect(res.status).toBe(200);

    const updated = await Customer.findById(customer._id);
    expect(updated.firstname).toBe("Johnny");
  });

  it("returns 400 for an invalid body", async () => {
    const customer = await createCustomer();

    const res = await request(app)
      .put(`/api/customers/${customer._id}`)
      .set("x-auth-token", token)
      .send({ firstname: "J" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .put(`/api/customers/${new mongoose.Types.ObjectId()}`)
      .set("x-auth-token", token)
      .send(validCustomer());

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/customers/:id", () => {
  it("returns 403 when the user is not an admin", async () => {
    const customer = await createCustomer();

    const res = await request(app)
      .delete(`/api/customers/${customer._id}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
    await expect(Customer.findById(customer._id)).resolves.not.toBeNull();
  });

  it("deletes the customer when the user is an admin", async () => {
    const customer = await createCustomer();

    const res = await request(app)
      .delete(`/api/customers/${customer._id}`)
      .set("x-auth-token", adminToken);

    expect(res.status).toBe(200);
    await expect(Customer.findById(customer._id)).resolves.toBeNull();
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .delete(`/api/customers/${new mongoose.Types.ObjectId()}`)
      .set("x-auth-token", adminToken);

    expect(res.status).toBe(404);
  });
});
