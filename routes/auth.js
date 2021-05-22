const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const requiresignin = require("../middleware/requiresignin");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

router.post("/signup", (req, res) => {
  const { name, password, email, pic } = req.body;
  if (!email || !password || !name) {
    return res
      .status(422)
      .json({ error: "Please add all the required fields" });
  }
  User.findOne({ email: email })
    .then((saveduser) => {
      if (saveduser) {
        return res
          .status(422)
          .json({ error: "User already exists with the email" });
      }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          profilePicture: pic,
        });
        user
          .save()
          .then((user) => {
            transporter.sendMail({
              to: user.email,
              from: "no-reply@netblog.com",
              subject: "signup successfully",
              html: "<h1> Welcome to NetBlog</h1>",
            });
            res.status(201).json({ message: "user saved successfully" });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "email or password field is empty" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid password or email" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          const {
            _id,
            name,
            email,
            followers,
            following,
            profilePicture,
          } = savedUser;
          const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
          res.status(200).json({
            token,
            user: { _id, name, email, followers, following, profilePicture },
          });
        } else {
          return res.status(422).json({ error: "Invalid Email or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

module.exports = router;
