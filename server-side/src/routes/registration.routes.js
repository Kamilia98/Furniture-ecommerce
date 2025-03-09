const express = require("express");
const router = express.Router();
const registerationController = require("../controllers/registration.controller");

router.post("/signup", registerationController.signup);
router.post("/login", registerationController.login);
router.post("/forgot-password", registerationController.forgotPassword);
router.post("/reset-password", registerationController.resetPassword);
module.exports = router;
