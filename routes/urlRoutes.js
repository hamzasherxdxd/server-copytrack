const UrlSchema = require("../models/UrlSchema");
const ProjectSchema = require("../models/ProjectSchema");
const UserSchema = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.post("/project/:id/url", async (req, res) => {
  const { url, pub_date, description, old_url } = req.body;
  console.log("ASDF");
  // const project_id = req.params.id;
  const project = await ProjectSchema.findOne({ project_id: req.params.id });
  const user = await UserSchema.findOne({username: req.session.user.username });
  if (!url) {
    return res.status(400).json({ message: "Fill all required fields" });
  }
  const newUrl = new UrlSchema({
    url: url,
    pub_date: pub_date,
    description: description,
    old_url: old_url,
    project_id: project._id,
    user: user._id,
  });

  const newUrlRes = await newUrl.save();
  if (newUrlRes) {
    return res.status(200).json({ message: "URL added successfully" });
  }
});

router.get("/project/:id/url", async (req, res) => {
  const project = await ProjectSchema.findOne({ project_id: req.params.id });
  const user = await UserSchema.findOne({ username: req.session.user.username });
  console.log(user._id, project._id);
  const url = await UrlSchema.find({
    user: user._id,
    project_id: project._id,
  });
  console.log(url);
  if (!url) {
    return res.status(404).json({ message: "Urls not found" });
  }
  return res.json({ url: url, message: "URL found" });
});

module.exports = router;
