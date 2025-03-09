const Ajv = require("ajv");
const ajv = new Ajv();

// User schema validation using Ajv library
const userSchema = {
  type: "object",
  properties: {
    username: { type: "string", pattern: "^[a-zA-Z]*$", minLength: 3 },
    email: {
      type: "string",
      pattern: "^[a-zA-Z0-9._]+@(gmail|yahoo|outlook)+.[a-z]{2,4}$",
    },
    password: { type: "string", minLength: 8 },
    phone: { type: "string", pattern: "^[0-9]{11}$" },
    role: { type: "string", enum: ["ADMIN", "USER"], default: "USER" },
  },
  required: ["username", "email", "password"],
  additionalProperties: false,
};
module.exports = ajv.compile(userSchema);
