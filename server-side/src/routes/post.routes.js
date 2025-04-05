const express = require("express");
const router = express.Router();
const postControllers = require("../controllers/post.controller");

router.route("/").get(postControllers.getAllPosts).post().delete();
router.route("/recent").get(postControllers.getRecentPosts);
router.route("/categories").get(postControllers.getCategories);
router.route("/related").get(postControllers.getRelatedPosts);
router.route("/categories").get(postControllers.getCategories);
router.route("/:id").get(postControllers.getPostById);

module.exports = router;
