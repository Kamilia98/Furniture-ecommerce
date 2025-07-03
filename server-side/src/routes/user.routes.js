const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');
const permissionTo = require('../middlewares/permissionTo.middleware');

// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per windowMs
// });

// router.use(limiter);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/favourites:
 *   get:
 *     summary: Get user favourites
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of user favourites
 */
router.route('/favourites').get(verifyToken, userController.getFavourites);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.route('/').get(verifyToken, userController.getAllUsers);

// verifyToken, allowedTo('ADMIN'),

/**
 * @swagger
 * /users/profile/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Password changed
 */
router
  .route('/profile/change-password')
  .put(verifyToken, userController.changePassword);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile updated
 */
router
  .route('/profile')
  .get(verifyToken, userController.getProfile)
  .put(verifyToken, userController.updateProfile);

/**
 * @swagger
 * /users/profile/change-img:
 *   put:
 *     summary: Change user profile image
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile image changed
 */
router.route('/profile/change-img').put(verifyToken, userController.changeIMG);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *   patch:
 *     summary: Edit user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 */
router
  .route('/:userId')
  .get(verifyToken, userController.getUser)
  .patch(userController.editUser)
  // verifyToken, allowedTo("ADMIN"),

  // .delete(verifyToken, allowedTo("ADMIN"), userController.deleteUser);
  .delete(verifyToken, userController.deleteUser);

/**
 * @swagger
 * /users/toggle-favourites:
 *   post:
 *     summary: Toggle user favourites
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Favourites toggled
 */
router
  .route('/toggle-favourites')
  .post(verifyToken, userController.toggleFavourite);

// Admin user management routes

/**
 * @swagger
 * /users/admin/users:
 *   get:
 *     summary: Get all admin users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of admin users
 */
router.get('/admin/users', verifyToken, userController.getAllAdminUsers);

/**
 * @swagger
 * /users/admin/users/{userId}:
 *   patch:
 *     summary: Edit admin user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin User ID
 *     responses:
 *       200:
 *         description: Admin user updated
 *   delete:
 *     summary: Delete admin user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin User ID
 *     responses:
 *       200:
 *         description: Admin user deleted
 */
router.patch('/admin/users/:userId', verifyToken, userController.editAdminUser);
router.delete(
  '/admin/users/:userId',
  verifyToken,
  userController.deleteAdminUser
);

module.exports = router;
