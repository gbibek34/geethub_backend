const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../auth/auth");

router.get("/signup", (req, res) => {
  res.send("hello");
});

router.post("/signup", (req, res) => {
  var { username, email, password } = req.body;
  console.log(req.body);
  if (!username || !email || !password) {
    return res.status(422).json({ error: "Add all data" });
  }

  bcrypt.hash(password, 12).then((hashedpw) => {
    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res
            .status(422)
            .json({ error: "User already exists with that email" });
        }
        const user = new User({
          email,
          password: hashedpw,
          username,
        });
        user
          .save()
          .then((user) => {
            res.json({ message: "Saved Successfully" });
            console.log(user.email);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post("/login", (req, res) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please add all fields" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid Email or password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((match) => {
        if (match) {
          if (!savedUser.isVerified) {
            return res.status(442).json({ error: "Account not verified" });
          }
          const token = jwt.sign({ _id: savedUser._id }, "mysecretkey");
          res.json({ token: token });
        } else {
          return res.status(422).json({ error: "Invalid email or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
module.exports = router;

router.get("/profile", auth.verifyUser, function (req, res) {
  console.log(req.userInfo.email);
  return res.json({ message: "user verified" });
});
