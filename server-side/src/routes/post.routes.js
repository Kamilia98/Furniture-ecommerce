const express = require("express");
const router = express.Router();
const postControllers = require("../controllers/post.controller");

router.route("/").get(postControllers.getAllPosts).post().delete();
router.route("/recent").get(postControllers.getRecentPosts);

module.exports = router;
