const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const requiresignin = require("../middleware/requiresignin");
const Post = mongoose.model("Post");

router.get("/user/:id", requiresignin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name")
        .exec((error, posts) => {
          if (error) {
            return res.status(422).json({ error });
          }
          res.status(200).json({ user, posts });
        });
    })
    .catch((error) => {
      return res.status(404).json({ error: "User not found" });
    });
});

router.put("/follow", requiresignin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    { new: true }
  ).exec((error, result) => {
    if (error) {
      return res.status(422).json({ error });
    }
    User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { following: req.body.followId },
      },
      { new: true }
    )
      .select("-password")
      .then((result) => {
        return res.status(201).json(result);
      })
      .catch((error) => {
        return res.status(422).json({ error });
      });
  });
});

router.put("/unfollow", requiresignin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    { new: true }
  ).exec((error, result) => {
    if (error) {
      return res.status(422).json({ error });
    }
    User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body.unfollowId },
      },
      { new: true }
    )
      .select("-password")
      .then((result) => {
        return res.status(201).json(result);
      })
      .catch((error) => {
        return res.status(422).json({ error });
      });
  });
});

router.put("/updatepic", requiresignin, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        profilePicture: req.body.profilePicture,
      },
    },
    { new: true },
    (error, result) => {
      if (error) {
        return res.status(422).json({ error: "pic cannot be posted" });
      }
      res.json(result);
    }
  );
});

module.exports = router;
