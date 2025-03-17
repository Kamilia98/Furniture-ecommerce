const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userValidation = require("../utils/userValidation");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const nodemailer = require("nodemailer");
const passport = require("passport");

// User Signup Route POST (/signup)
const signup = asyncWrapper(async (req, res, next) => {
  const user = req.body;
  if (!userValidation(user)) {
    return next(new AppError("Invalid user data.", 400, httpStatusText.FAIL));
  }

  let foundedUser = await userModel.findOne({
    email: user.email,
  });
  if (foundedUser) {
    return next(
      new AppError(
        "User with this email already exists.",
        400,
        httpStatusText.FAIL
      )
    );
  }

  let genSalt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, genSalt);

  userModel
    .create(user)
    .then((user) => {
      res.status(201).json({
        status: httpStatusText.SUCCESS,
        message: "User signed up successfully",
      });
    })
    .catch((error) => {
      return next(
        error,
        new AppError("Error registering user.", 500, httpStatusText.ERROR)
      );
    });
});
// Login Route POST (/login)
const login = asyncWrapper(async (req, res, next) => {
  const user = req.body;
  let foundedUser = await userModel.findOne({
    email: user.email,
  });
  if (!foundedUser) {
    return next(
      new AppError("Invalid email or password.", 400, httpStatusText.FAIL)
    );
  }
  let isMatch = await bcrypt.compare(user.password, foundedUser.password);
  if (!isMatch) {
    return next(
      new AppError("Invalid email or password.", 400, httpStatusText.FAIL)
    );
  }
  const token = jwt.sign(
    {
      email: foundedUser.email,
      username: foundedUser.username,
      _id: foundedUser._id,
      role: foundedUser.role,
    },
    process.env.JWT_SECRET
  );

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Logged in successfully",
    data: { token },
  });
});
//

const google = (req, res, next) => {
  const token = jwt.sign(
    {
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      _id: req.user._id,
    },
    process.env.JWT_SECRET
  );
  res.redirect(`http://localhost:4200/auth/login?token=${token}`);
};
// const code = req.query.code;
// const { tokens } = await googleAuth.verifyIdToken(code);
// const payload = jwt.decode(tokens.id_token);
// let user;
// let foundedUser = await userModel.findOne({ email: payload.email });
// if (!foundedUser) {
//   user = await userModel.create({
//     email: payload.email,
//     username: payload.name,
//     role: "user",
//   });
// }
// const token = jwt.sign(
//   {
//     email: user.email,
//     username: user.username,
//     _id: user._id,
//     role: user.role,
//   },
//   process.env.JWT_SECRET
// );
// res.status(201).json({
//   status: httpStatusText.SUCCESS,
//   message: "Logged in successfully",
//   data: { token },
// });

// const google = asyncWrapper(async (req, res, next) => {
//   const code = req.query.code;
//   const { tokens } = await googleAuth.verifyIdToken(code);
//   const payload = jwt.decode(tokens.id_token);
//   let user = await userModel.findOne({ email: payload.email });
//   if (!user) {
//     user = await userModel.create({
//       email: payload.email,
//       username: payload.name,
//       role: "user",
//     });
//   }
//   const token = jwt.sign(
//     {
//       email: user.email,
//       username: user.username,
//       _id: user._id,
//       role: user.role,
//     },
//     process.env.JWT_SECRET
//   );
//   res.status(201).json({
//     status: httpStatusText.SUCCESS,
//     message: "Logged in successfully",
//     data: { token },
//   });
const logout = asyncWrapper(async (req, res, next) => {});
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new AppError(
        "User with this email doesn't exist.",
        400,
        httpStatusText.FAIL
      )
    );
  }
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 600000;

  await user.save();
  const resetLink = `http://localhost:4200/register/reset-password?token=${user.resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Reset Password",
    text: `Dear ${user.username} : 
    Click the link to reset your password: ${resetLink}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return next(
        new AppError("Error sending email.", 500, httpStatusText.ERROR)
      );
    }
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      message: "Email sent successfully.",
    });
  });
});
const resetPassword = asyncWrapper(async (req, res, next) => {
  const { token, password } = req.body;
  let user = await userModel.findOne({ resetToken: token });
  if (!user || user.resetTokenExpiry < Date.now()) {
    return next(
      new AppError("Invalid or expired token.", 400, httpStatusText.FAIL)
    );
  }
  let genSalt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, genSalt);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Password reset successfully.",
  });
});
module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
  google,
  logout,
};
