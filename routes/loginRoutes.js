const UserSchema = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const { response } = require("..");
const client = new OAuth2Client(
  "389927153738-9n3bpvcsb4barloiflhdec28s7o7q2mr.apps.googleusercontent.com",
  "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",
  "postmessage"
);
const config = require("config");
const jwt = require("jsonwebtoken");
const axios = require("axios");

router.get("/user", async (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    const user = await UserSchema.findOne({
      username: req.session.user.username,
    });
    return res.status(200).json({ meesage: "found", data: user });
  } else {
    return res.status(404).json({ message: "not found" });
  }
  //   if (!user) {
  //     return res.status(404).json({ message: "not found" });
  //   } else {
  //     return res.status(200).json({ message: "found", data: user });
  //   }
});

router.post("/register", async (req, res) => {
  console.log("Access Token: " + req.body.googleAccessToken);
  if (req.body.googleAccessToken) {
    const { googleAccessToken } = req.body;
    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: "Bearer " + googleAccessToken,
        },
      })
      .then(async (response) => {
        console.log("Response: " + response.data.email);
        const username = response.data.given_name + response.data.family_name;
        const email = response.data.email;
        const existingUser = await UserSchema.findOne({
          email: email,
        });
        if (existingUser) {
          return res.status(400).json({ message: "User already registered" });
        }
        const result = await UserSchema.create({
          email: email,
          username: username,
        });
        console.log("Result: " + result);
        const token = jwt.sign(
          {
            email: result.email,
            id: result._id,
          },
          config.get("JWT_SECRET"),
          { expiresIn: "1h" }
        );
        res.status(200).json({ result, token });
      })
      .catch((err) => {
        console.log(err.message);
        res.status(400).json({ message: "Invalid token" });
      });
  } else {
    const { username, email, password } = req.body;

    if (!email || !password || !username)
      return res.status(400).json({ msg: "Password and email are required" });

    if (password.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password should be at least 8 characters long" });
    }

    const user = await UserSchema.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new UserSchema({ username, email, password });
    bcrypt.hash(password, 7, async (err, hash) => {
      if (err)
        return res.status(400).json({ msg: "error while saving the password" });

      newUser.password = hash;
      const savedUserRes = await newUser.save();

      if (savedUserRes)
        return res.status(200).json({ msg: "user is successfully saved" });
    });
  }
});

router.post(`/login`, async (req, res) => {
  if (req.body.googleAccessToken) {
    const { googleAccessToken } = req.body;
    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: "Bearer " + googleAccessToken,
        },
      })
      .then(async (response) => {
        console.log(response.data);
        const email = response.data.email;

        const existingUser = await UserSchema.findOne({ email });
        if (!existingUser) {
          console.log("NOT FOUND");
          return res.status(404).json({ message: "User not found" });
        }
        const token = jwt.sign(
          {
            email: existingUser.email,
            id: existingUser._id,
          },
          config.get("JWT_SECRET"),
          { expiresIn: "1h" }
        );
        const userSession = {
          email: existingUser.email,
          id: existingUser._id,
          username: existingUser.username,
        };
        req.session.user = userSession;
        console.log(req.session.user);
        return res.status(200).json({ result: existingUser, token, userSession });
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(400).json({ message: "Invalid token" });
      });
  } else {
    const { email, password } = req.body;
    if (email === "" || password === "") {
      return res.status(400).json({ message: "Invalid field" });
    }

    try {
      const existingUser = await UserSchema.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const isPasswordOk = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordOk) {
        return res.status(404).json({ message: "Password is incorrect" });
      }
      const token = jwt.sign(
        {
          email: existingUser.email,
          id: existingUser._id,
        },
        config.get("JWT_SECRET"),
        { expiresIn: "1h" }
      );
      const userSession = {
        email: existingUser.email,
        id: existingUser._id,
        username: existingUser.username,
      }
      req.session.user = userSession;
      console.log(req.session.user);
      res.status(200).json({ result: existingUser, token, userSession});
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    // const { email, password } = req.body;

    // if (!email || !password) {
    //   res.status(400).json({ msg: "Something missing" });
    // }

    // const user = await UserSchema.findOne({ email: email }); // finding user in db
    // if (!user) {
    //   return res.status(400).json({ msg: "User not found" });
    // }

    // const matchPassword = await bcrypt.compare(password, user.password);
    // if (matchPassword) {
    //   const userSession = {
    //     id: user._id,
    //     username: user.username,
    //     email: user.email,
    //   }; // creating user session to keep user loggedin also on refresh
    //   req.session.user = userSession; // attach user session to session object from express-session

    //   return res
    //     .status(200)
    //     .json({ msg: "You have logged in successfully", userSession }); // attach user session id to the response. It will be transfer in the cookies
    // } else {
    //   return res.status(400).json({ msg: "Invalid credential" });
    // }
  }
});

router.delete(`/logout`, async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(err.code).json({ msg: err.message });
      } else {
        res.send("Logout Successfully");
      }
    });
  } else {
    res.end();
  }
  //   req.session.destroy((error) => {
  //     if (error) throw error;

  //     res.clearCookie("session-id"); // cleaning the cookies from the user session
  //     res.status(200).send("Logout Success");
  //   });
});

router.get("/isAuth", async (req, res) => {
  // console.log(req.session);
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    return res.status(401).json("unauthorize");
  }
});

// router.post("/v1/auth/google", async (req, res) => {
//   console.log(req.body);
//   const token = await client.getToken(req.body.code);
//   // const { token } = await client.getToken(req.body.code);
//   const ticket = await client.verifyIdToken({
//     idToken: req.body.code,
//     audience:
//       "389927153738-9n3bpvcsb4barloiflhdec28s7o7q2mr.apps.googleusercontent.com",
//   });
//   const { name, email } = ticket.getPayload();
//   const user = await UserSchema.updateOne(
//     {
//       email: email,
//     },
//     { upsert: true }
//   );
//   req.session.user = user;

//   res.status(201);
//   // res.json(user);
// });

// router.post("/v1/user-auth", async (req, res) => {
//   console.log(req.body);
//   const { token } = req.body;
//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience:
//         "389927153738-9n3bpvcsb4barloiflhdec28s7o7q2mr.apps.googleusercontent.com",
//     });
//     // const payload = ticket.getPayload();
//     const { name, email } = ticket.getPayload();
//     const user = await UserSchema.updateOne(
//       {
//         email: email,
//       },
//       { upsert: true }
//     );
//     req.session.user = user;
//   } catch (error) {
//     console.log(error);
//     res.send({
//       payload: {},
//       isSuccess: false,
//     });
//   }
// });

module.exports = router;
