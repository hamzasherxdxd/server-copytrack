const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  url: {
    type: String,
    required: true,
  },
  old_url: {
    type: String,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  pub_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

module.exports = mongoose.model("Url", UrlSchema);
