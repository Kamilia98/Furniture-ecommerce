const Contact = require("../models/contact.model");
const asyncWrapper = require("../middlewares/asyncWrapper.middleware");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const nodemailer = require("nodemailer");
require("dotenv").config();

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

const sendMessage = asyncWrapper(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return next(new AppError("Please fill all required fields.", 400, httpStatusText.FAIL));
  }

  const newMessage = new Contact({ name, email, subject, message });
  await newMessage.save();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "menna00essam@gmail.com", 
    subject: `New Contact Message: ${subject || "No Subject"}`,
    text: `You have a new message from:
    
    Name: ${name}
    Email: ${email}
    
    Message:
    ${message}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return next(new AppError("Error sending email.", 500, httpStatusText.ERROR));
    }
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      message: "Message sent successfully!",
    });
  });
});

module.exports = {
  sendMessage,
};
