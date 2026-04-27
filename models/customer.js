const mongoose = require("mongoose");
const Joi = require("joi");

const mongoSchema = {
  firstname: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 255,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 255,
    lowercase: true,
    trim: true
  },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  phone: String,
  income: {
    type: Number,
    required: function() {
      return this.age > 15;
    },
    min: 10000,
    max: 100000000,
    get: v => Math.round(v),
    set: v => Math.round(v)
  },
  address: String,
  created: { type: Date, default: Date.now },
  tags: {
    type: Array,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: "A customer should have at least one tag."
    }
  }
};

const clientSchema = Joi.object({
  firstname: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .required(),
  lastname: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .lowercase()
    .required(),
  age: Joi.number().required(),
  gender: Joi.string()
    .valid("Male", "Female")
    .required(),
  phone: Joi.string(),
  income: Joi.number()
    .min(10000)
    .max(100000000)
    .when("age", { is: "15+", then: Joi.required() }),
  address: Joi.string(),
  created: Joi.date().default(Date.now),
  tags: Joi.array()
});

const Customer = mongoose.model("Customer", new mongoose.Schema(mongoSchema));

function validateCustomer(customer) {
  return clientSchema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
