const express = require('express');
const router = express.Router();
const registerationController = require('../controllers/registration.controller');
const passport = require('passport');
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per windowMs
// });

// router.use(limiter);

router.post('/signup', registerationController.signup);
router.post('/login', registerationController.login);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/redirect',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  registerationController.google
);
router.get('/logout', registerationController.logout);
router.post('/forgot-password', registerationController.forgotPassword);
router.post('/reset-password', registerationController.resetPassword);

router.post('/admin/invite', registerationController.inviteAdmin);

module.exports = router;
