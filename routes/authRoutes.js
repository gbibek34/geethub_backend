const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const UserVerification = require('../models/userVerificationModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('../auth/auth');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendEmail');

router.post('/signup', (req, res) => {
  var { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Add all data', success: false });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    return res
      .status(400)
      .json({ msg: 'Name should contain only letters', success: false });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ msg: 'Invalid email', success: false });
  } else if (password.length < 8) {
    return res.status(400).json({
      msg: 'Password should be atleast 8 characters long',
      success: false,
    });
  } else {
    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res.status(400).json({
            msg: 'User already exists with that email',
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
  uniqueString = crypto.randomBytes(32).toString('hex');

  const newVerification = new UserVerification({
    userId: _id,
    uniqueString: uniqueString,
  });
  newVerification
    .save()
    .then(() => {
      sendMail(email, 'Verify Your Email', 'Geethub', 'emailVerification', {
        name: name,
        currentUrl: currentUrl,
        _id: _id,
        uniqueString: uniqueString,
      }).then(() => {
        return res.status(200).json({
          msg: 'Verification email sent to your registered email address',
          success: true,
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: err.message, success: false });
    });
};

router.get('/verify/:userId/:uniqueString', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (!user)
      return res.status(200).json({ msg: "User does not exist try signup or check the link again", success: false });
    if(user.is_authenticated)
      return res.status(200).json({ msg: "User is already verified", success: true });
    const token = await UserVerification.findOne({
      userId: user._id,
      uniqueString: req.params.uniqueString,
    });
    if (!token)
      return res.status(200).json({ msg: "Invalid link or token expired try logging in for new email", success: false });

    await User.updateOne({ _id: user._id }, { is_authenticated: true });
    await token.remove();

    return res
      .status(200)
      .json({ msg: 'Email verified successfully', success: true });
  } catch (err) {
    return res.status(500).json({ msg: "Invalid Link", success: false });
  }
});

router.post('/login', (req, res) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ msg: 'Please add all fields', success: false });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res
        .status(400)
        .json({ msg: 'Invalid Email or password', success: false });
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
                } else {
                  UserVerification.findOneAndDelete({ userId: savedUser._id })
                    .then(sendVerificationEmail(savedUser, res))
                    .catch((err) => {
                      return res
                        .status(500)
                        .json({ msg: 'Internal Server Error', success: false });
                    });
                }
              })
              .catch((err) => {
                return res
                  .status(400)
                  .json({ msg: err.message, success: false });
              });
          } else {
            const token = jwt.sign({ _id: savedUser._id }, 'mysecretkey');
            res.status(200).json({ token: token, success: true });
          }
        } else {
          return res
            .status(400)
            .json({ msg: 'Invalid email or password', success: false });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.get('/profile', auth.verifyUser, function (req, res) {
  console.log(req.userInfo.email);
  return res.status(200).json({ success: true, msg: 'user verified' });
});

module.exports = router;
