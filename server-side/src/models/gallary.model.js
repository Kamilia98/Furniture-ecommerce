const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  public_id: String,
  url: String,
});

module.exports  = mongoose.model("Image", imageSchema);

