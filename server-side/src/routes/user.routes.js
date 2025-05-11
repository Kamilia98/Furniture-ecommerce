const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middlewares/auth.middleware');
const allowedTo = require('../middlewares/allowTo.middleware');
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per windowMs
// });

// router.use(limiter);

router.route('/favourites').get(verifyToken, userController.getFavourites);
router.route('/').get(verifyToken, userController.getAllUsers);
// verifyToken, allowedTo('ADMIN'),

router
  .route('/profile/change-password')
  .put(verifyToken, allowedTo('USER'), userController.changePassword);
router
  .route('/profile')
  .get(
    verifyToken,
    allowedTo('USER', 'ADMIN', 'MANAGER', 'EDITOR'),
    userController.getProfile
  )
  .put(
    verifyToken,
    allowedTo('USER', 'ADMIN', 'MANAGER', 'EDITOR'),
    userController.updateProfile
  );
router.route('/profile/change-img').put(verifyToken, userController.changeIMG);
router
  .route('/:userId')
  .get(verifyToken,userController.getUser)
  .patch(userController.editUser)
  // verifyToken, allowedTo("ADMIN"),
  .delete(verifyToken, allowedTo('ADMIN'), userController.deleteUser);
router
  .route('/toggle-favourites')
  .post(verifyToken, userController.toggleFavourite);

// Admin user management routes
router.get(
  '/admin/users',
  verifyToken,
  allowedTo('ADMIN', 'MANAGER'),
  userController.getAllAdminUsers
);
router.patch(
  '/admin/users/:userId',
  verifyToken,
  allowedTo('ADMIN', 'MANAGER'),
  userController.editAdminUser
);
router.delete(
  '/admin/users/:userId',
  verifyToken,
  allowedTo('ADMIN', 'MANAGER'),
  userController.deleteAdminUser
);

module.exports = router;
