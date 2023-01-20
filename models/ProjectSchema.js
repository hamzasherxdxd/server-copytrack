const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);
const ProjectSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    ref: "User",
  },
  project_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  email_notifications: {
    type: Boolean,
    default: false,
  },
});


ProjectSchema.plugin(autoIncrement.plugin, {
  model: "Project",
  field: "project_id",
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
