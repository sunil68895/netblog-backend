const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const requiresignin = require("../middleware/requiresignin");
const Post = mongoose.model("Post");

router.get("/allpost", requiresignin, (req, res) => {
  Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((posts) => {
      res.status(200).json({ posts });
    })
    .catch((error) => {
      console.log("error");
    });
});

router.get("/getsubscribeposts", requiresignin, (req, res) => {
  Post.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((posts) => {
      res.status(200).json({ posts });
    })
    .catch((error) => {
      console.log("error");
    });
});

router.post("/createpost", requiresignin, (req, res) => {
  const { title, body, photo } = req.body;
  if (!title || !body || !photo) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    body,
    photo,
    postedBy: req.user._id,
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/myposts", requiresignin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((myposts) => {
      res.status(200).json({ myposts });
    })
    .catch((error) => {
      console.log("error");
    });
});

router.put("/like", requiresignin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json({ error: error });
      } else {
        res.json(result);
      }
    });
});

router.put("/unlike", requiresignin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json({ error: error });
      } else {
        res.json(result);
      }
    });
});

router.put("/comment", requiresignin, (req, res) => {
  const comment = { text: req.body.text, postedBy: req.user._id };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((error, result) => {
      if (error) {
        return res.status(422).json({ error: error });
      } else {
        res.json(result);
      }
    });
});

router.delete("/deletepost/:postId", requiresignin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((error, post) => {
      if (error || !post) {
        return res.status(422).json({ error });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.status(201).json(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
});
module.exports = router;
