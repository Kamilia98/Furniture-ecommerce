const express = require("express");
const router = express.Router();
const registerationController = require("../controllers/registration.controller");
const passport = require("passport");
router.post("/signup", registerationController.signup);
router.post("/login", registerationController.login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  registerationController.google
);
router.get("/logout", registerationController.logout);
router.post("/forgot-password", registerationController.forgotPassword);
router.post("/reset-password", registerationController.resetPassword);
module.exports = router;
