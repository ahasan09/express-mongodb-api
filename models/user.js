const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");

const generateUsername = context => {
  return context.firstname.toLowerCase() + "-" + context.lastname.toLowerCase();
};
generateUsername.description = "generated username";

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

function validateEmail(email) {
  return emailRegex.test(email);
}

const mongoSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 50,
    required: true
  },
  email: {
    type: String,
    minLength: 5,
    maxLength: 255,
    validate: {
      validator: function(v) {
        return validateEmail(v);
      },
      message: props => `${props.value} is not a valid email!`
    },
    required: true,
    unique: true
  },
  password: {
    type: String,
    minLength: 5,
    maxLength: 1024,
    // validate: {
    //   validator: function(v) {
    //     return /^[a-zA-Z0-9]{3,30}$/.test(v);
    //   },
    //   message: props => `${props.value} is not a valid password!`
    // },
    required: [true, "Password is required"],
    trim: true
  },
  created: { type: Date, default: Date.now },
  isAdmin: Boolean
});

mongoSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      isAdmin: this.isAdmin
    },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", mongoSchema);

const clientSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(50)
    .required()
    .trim(),
  email: Joi.string()
    .min(5)
    .max(250)
    //.email({ minDomainAtoms: 2 })
    .email()
    .required()
    .trim(),
  password: Joi.string()
    .min(5)
    .max(255)
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required()
    .trim(),
  created: Joi.date().default(Date.now)
});

function validateUser(user) {
  return clientSchema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
