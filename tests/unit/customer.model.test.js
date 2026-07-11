const { validate } = require("../../models/customer");

describe("validate (customer Joi schema)", () => {
  const validCustomer = () => ({
    firstname: "John",
    lastname: "Doe",
    age: 30,
    gender: "Male",
    income: 50000,
    tags: ["regular"]
  });

  it("accepts a valid customer", () => {
    const { error } = validate(validCustomer());
    expect(error).toBeUndefined();
  });

  it("lowercases and trims the lastname", () => {
    const customer = { ...validCustomer(), lastname: "  DOE  " };
    const { error, value } = validate(customer);
    expect(error).toBeUndefined();
    expect(value.lastname).toBe("doe");
  });

  it("rejects a missing firstname", () => {
    const customer = validCustomer();
    delete customer.firstname;
    const { error } = validate(customer);
    expect(error.details[0].path).toContain("firstname");
  });

  it("rejects a firstname shorter than 2 characters", () => {
    const customer = { ...validCustomer(), firstname: "J" };
    const { error } = validate(customer);
    expect(error.details[0].path).toContain("firstname");
  });

  it("rejects a gender outside Male/Female", () => {
    const customer = { ...validCustomer(), gender: "Other" };
    const { error } = validate(customer);
    expect(error.details[0].path).toContain("gender");
  });

  it("rejects an income below 10000", () => {
    const customer = { ...validCustomer(), income: 500 };
    const { error } = validate(customer);
    expect(error.details[0].path).toContain("income");
  });

  it("rejects a non-numeric age", () => {
    const customer = { ...validCustomer(), age: "old" };
    const { error } = validate(customer);
    expect(error.details[0].path).toContain("age");
  });
});
