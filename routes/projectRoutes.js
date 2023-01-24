const ProjectSchema = require("../models/ProjectSchema");
const UserSchema = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.post("/project", async (req, res) => {
  // console.log(req.body);
  // console.log("user", req.session.user);
  // console.log("user", req.session);
  const { project_name, description, email_notification } = req.body;
  const user = await UserSchema.findOne({ username: req.session.user.username });

  if (!project_name || !description) {
    return res.status(400).json({ message: "Fill all required fields" });
  }

  const newProject = new ProjectSchema({
    project_name: project_name,
    description: description,
    email_notification,
    user: user,
  });


  const newProjectRes = await newProject.save();
  if (newProjectRes) {
    return res.status(200).json({ message: "Project saved successfully" });
  }
});

router.get("/project", async (req, res) => {
  const user = await UserSchema.findOne({ username: req.session.user.username });
  const projects = await ProjectSchema.find({user: user._id});
  // console.log(req.session.user);
  // console.log(projects);
  if (projects.length > 0) {
    return res.status(200).json({ message: "Projects ", projects});
  } else {
    return res.status(404).json({ message: "Project not found" });
  }
});

router.get('/project/:id', async (req, res) => {
  const project = await ProjectSchema.findOne({project_id: req.params.id});
  // console.log(req.session);
  // console.log(project.user, req.session.user.username)
  // if (req.session.user.username === project.user)
  // console.log(project);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  return res.json({ project: project, message: "Project found" });

})

module.exports = router;

