const mongoose = require("mongoose");

const GoogleAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  account_name: {
    type: String,
  },
  account_id: {
    type: String,
  },
  property_name: {
    type: String,
  },
  property_id: {
    type: String,
  },
  url: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "Url"
    type: String,
  },
  profile_name: {
    type: String,
  },
  profile_id: {
    type: String,
  },
  timezone: {
    type: String,
  },
  time_shift: {
    type: Number,
  },
  active: {
    type: Boolean,
  },
});

const GoogleAnalytics = mongoose.model(
  "GoogleAnalytics",
  GoogleAnalyticsSchema
);

module.exports = GoogleAnalytics;
