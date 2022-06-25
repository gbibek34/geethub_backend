const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userModel");
const UserVerification = require("../models/userVerificationModel");
const PasswordReset = require("../models/passwordResetModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const auth = require("../auth/auth");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendEmail");

router.post("/signup", (req, res) => {
  var { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Add all data", success: false });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    return res
      .status(400)
      .json({ msg: "Name should contain only letters", success: false });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ msg: "Invalid email", success: false });
  } else if (password.length < 8) {
    return res.status(400).json({
      msg: "Password should be atleast 8 characters long",
      success: false,
    });
  } else {
    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res.status(400).json({
            msg: "User already exists with that email",
            success: false,
          });
        } else {
          const saltRound = 10;
          bcrypt
            .hash(password, saltRound)
            .then((hashedPassword) => {
              const user = new User({
                name,
                email,
                password: hashedPassword,
              });
              user
                .save()
                .then((user) => {
                  sendVerificationEmail(user, res);
                })
                .catch((err) => {
                  return res
                    .status(400)
                    .json({ msg: err.message, success: false });
                });
            })
            .catch((err) => {
              return res.status(400).json({ msg: err.message, success: false });
            });
        }
      })
      .catch((err) => {
        return res.status(400).json({ msg: err.message, success: false });
      });
  }
});

const sendVerificationEmail = ({ _id, email, name }, res) => {
  const currentUrl = process.env.BASE_URL;
  uniqueString = crypto.randomBytes(32).toString("hex");

  const newVerification = new UserVerification({
    userId: _id,
    uniqueString: uniqueString,
  });
  newVerification
    .save()
    .then(() => {
      sendMail(email, "Verify Your Email", "Geethub", "emailVerification", {
        name: name,
        currentUrl: currentUrl,
        _id: _id,
        uniqueString: uniqueString,
      }).then(() => {
        return res.status(200).json({
          msg: "Verification email sent to your registered email address",
          success: true,
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: err.message, success: false });
    });
};

router.get("/verify/:userId/:uniqueString", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (!user)
      return res.status(200).json({
        msg: "User does not exist try signup or check the link again",
        success: false,
      });
    if (user.is_authenticated)
      return res
        .status(200)
        .json({ msg: "User is already verified", success: true });
    const token = await UserVerification.findOne({
      userId: user._id,
      uniqueString: req.params.uniqueString,
    });
    if (!token)
      return res.status(200).json({
        msg: "Invalid link or token expired try logging in for new email",
        success: false,
      });

    await User.updateOne({ _id: user._id }, { is_authenticated: true });
    await token.remove();

    return res
      .status(200)
      .json({ msg: "Email verified successfully", success: true });
  } catch (err) {
    return res.status(500).json({ msg: "Invalid Link", success: false });
  }
});

router.post("/login", (req, res) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ msg: "Please add all fields", success: false });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res
        .status(400)
        .json({ msg: "Invalid Email or password", success: false });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((match) => {
        if (match) {
          if (!savedUser.is_authenticated) {
            UserVerification.findOne({ userId: savedUser._id })
              .then((result) => {
                if (result === null) {
                  sendVerificationEmail(savedUser, res);
                  return res
                    .status(200)
                    .json({ msg: "Verification email sent", success: false });
                } else {
                  UserVerification.findOneAndDelete({ userId: savedUser._id })
                    .then(sendVerificationEmail(savedUser, res))
                    .catch((err) => {
                      return res
                        .status(500)
                        .json({ msg: "Internal Server Error", success: false });
                    });
                }
              })
              .catch((err) => {
                return res
                  .status(400)
                  .json({ msg: err.message, success: false });
              });
          } else {
            const token = jwt.sign({ _id: savedUser._id }, "mysecretkey");
            return res.status(200).json({
              token: token,
              success: true,
              isAdmin: savedUser.isAdmin,
            });
          }
        } else {
          return res
            .status(400)
            .json({ msg: "Invalid email or password", success: false });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.get("/profile", auth.verifyUser, function (req, res) {
  return res.status(200).json({ success: true, msg: "user verified" });
});

// Get user by id
router.get("/user/:id", auth.verifyUser, function (req, res) {
  const id = req.params.id;
  const user = User.findOne({ _id: id }).then(function (userData) {
    if (userData != null) {
      res.status(200).json({ data: userData, success: true });
    } else {
      res.status(400).json({ msg: "Operation Unsuccessful", success: false });
    }
  });
});

// change password
router.post("/change-password", auth.verifyUser, function (req, res) {
  const { oldPassword, newPassword } = req.body;
  if (newPassword.length < 8) {
    return res.status(400).json({
      msg: "Password should be atleast 8 characters long",
      success: false,
    });
  } else {
    User.findOne({ _id: req.userInfo._id }).then(function (userData) {
      if (userData != null) {
        bcrypt
          .compare(oldPassword, userData.password)
          .then((match) => {
            if (match) {
              bcrypt
                .hash(newPassword, 10)
                .then((hashedPassword) => {
                  User.updateOne(
                    { _id: req.userInfo._id },
                    { password: hashedPassword }
                  )
                    .then(function (userData) {
                      res.status(200).json({
                        msg: "Password changed successfully",
                        success: true,
                      });
                    })
                    .catch(function (err) {
                      res
                        .status(400)
                        .json({ msg: err.message, success: false });
                    });
                })
                .catch((err) => {
                  res.status(400).json({ msg: err.message, success: false });
                });
            } else {
              res
                .status(400)
                .json({ msg: "Old password is incorrect", success: false });
            }
          })
          .catch((err) => {
            res.status(400).json({ msg: err.message, success: false });
          });
      } else {
        res.status(400).json({ msg: "Operation Unsuccessful", success: false });
      }
    });
  }
});

// forget password
router.post("/forgot-password", function (req, res) {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        sendResetEmail(user, res);
      } else {
        res
          .status(400)
          .json({ msg: "User with email does not exists", success: false });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Operation Unsuccessful", success: false });
    });
});

const sendResetEmail = ({ _id, email, name }, res) => {
  const currentUrl = process.env.BASE_URL;
  uniqueString = crypto.randomBytes(32).toString("hex");

  PasswordReset.deleteMany({ userId: _id })
    .then(() => {
      const newPasswordReset = new PasswordReset({
        userId: _id,
        uniqueString: uniqueString,
      });
      newPasswordReset
        .save()
        .then(() => {
          sendMail(email, "Password Reset Link", "Geethub", "resetPassword", {
            name: name,
            currentUrl: currentUrl,
            _id: _id,
            uniqueString: uniqueString,
          })
            .then(() => {
              return res.status(200).json({
                msg: "Reset email sent to your registered email address",
                success: true,
              });
            })
            .catch((err) => {
              return res.status(500).json({ msg: err.message, success: false });
            });
        })
        .catch((err) => {
          return res.status(500).json({ msg: err.message, success: false });
        });
    })
    .catch((err) => {
      return res.status(500).json({ msg: err.message, success: false });
    });
};

router.put("/reset-password/:userId/:uniqueString", async (req, res) => {
  const password = req.body.password;

  if (password.length < 8) {
    return res.status(400).json({
      msg: "Password should be atleast 8 characters long",
      success: false,
    });
  } else {
    try {
      const user = await User.findOne({ _id: req.params.userId });
      if (!user)
        return res.status(200).json({
          msg: "User does not exist check the link again",
          success: false,
        });
      const token = await PasswordReset.findOne({
        userId: user._id,
        uniqueString: req.params.uniqueString,
      });
      if (!token)
        return res.status(200).json({
          msg: "Invalid link or token expired try requesting new link",
          success: false,
        });

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ _id: user._id }, { password: hashedPassword });

      await token.remove();

      return res.status(200).json({ msg: "Password Updated", success: true });
    } catch (err) {
      return res.status(500).json({ msg: "Invalid Link", success: false });
    }
  }
});

// verify password reset link
router.get("/reset-password/:userId/:uniqueString", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (!user)
      return res.status(400).send({ msg: "Invalid link", success: false });

    const token = await PasswordReset.findOne({
      userId: user._id,
      uniqueString: req.params.uniqueString,
    });
    if (!token)
      return res.status(400).send({ msg: "Invalid link", success: false });

    return res.status(200).send("Valid Url");
  } catch (error) {
    return res
      .status(500)
      .send({ msg: "Internal Server Error", success: false });
  }
});

module.exports = router;
