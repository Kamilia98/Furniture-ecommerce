const joi = require("joi");

const userSchema = joi.object({
  name: joi.string().required().min(3).trim(),
  email: joi.string().email().required().trim(),
  password: joi.string().min(8).trim().required(),
});

module.exports = userSchema;
