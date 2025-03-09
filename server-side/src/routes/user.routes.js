const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowedTo = require("../middlewares/allowTo.middleware");

router.route("/favourites").get(verifyToken, userController.getFavourites);
router
  .route("/")
  .get(verifyToken, allowedTo("ADMIN"), userController.getAllUsers);
router
  .route("/:userId")
  .get(verifyToken, allowedTo("ADMIN"), userController.getUser)
  .patch(verifyToken, allowedTo("ADMIN"), userController.editUser)
  .delete(verifyToken, allowedTo("ADMIN"), userController.deleteUser);
router
  .route("/toggle-favourites")
  .post(verifyToken, userController.toggleFavourite);

module.exports = router;
