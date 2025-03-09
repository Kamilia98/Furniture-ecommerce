const express = require("express");
const {updatedImages,getImages,cloudinaryWebhookHandler}= require("../controllers/gallery.controller");

const router = express.Router();

router.get("/updated-images", updatedImages);
router.get("/images", getImages);
// router.post("/cloudinary-webhook", cloudinaryWebhookHandler);
module.exports = router;
