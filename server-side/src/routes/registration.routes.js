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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and registration
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/signup', registerationController.signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged in
 */
router.post('/login', registerationController.login);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /auth/google/redirect:
 *   get:
 *     summary: Google OAuth redirect
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Google OAuth callback
 */
router.get(
  '/google/redirect',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  registerationController.google
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: User logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out
 */
router.get('/logout', registerationController.logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/forgot-password', registerationController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset
 */
router.post('/reset-password', registerationController.resetPassword);

/**
 * @swagger
 * /auth/admin/invite:
 *   post:
 *     summary: Invite admin
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Admin invited
 */
router.post('/admin/invite', registerationController.inviteAdmin);

module.exports = router;
