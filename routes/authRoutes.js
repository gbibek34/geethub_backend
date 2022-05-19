const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const UserVerification = mongoose.model("UserVerification");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take messages");
  }
});

router.post("/signup", (req, res) => {
  var { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Add all data", success: false });
  } else if (!/^[a-zA-Z]*$/.test(name)) {
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
  const currentUrl = "http://localhost:5000/";
  const uniqueString = uuidv4() + _id;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email Address",
    html: `
    <h2>Hello ${name},</h2>
    <h3>
    You have registered an account on geethub, before being able to use your account you need to verify that this is your email address by clicking the verify button.
    </h3>
    <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
        <td>
            <table cellspacing="0" cellpadding="0">
                <tr>
                    <td style="border-radius: 2px;" bgcolor="#3D85A3">
                        <a href="${currentUrl}verify/${_id}/${uniqueString}" target="_blank" style="padding: 8px 12px; border: 1px solid #3D85A3;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                            Verify Email             
                        </a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
  </table>
  <p>This Link will expires in 24 hours</p>
  <hr>
  <p>If you have problems, please paste the below URL into your web browser.</p>
  <p>${currentUrl}verify/${_id}/${uniqueString}</p>
  <hr>
  <p>Thanks! Geethub team</p>
  `,
  };

  const saltRound = 10;
  bcrypt
    .hash(uniqueString, saltRound)
    .then((hashedString) => {
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
      newVerification
        .save()
        .then(() => {
          transporter.sendMail(mailOptions).then(() => {
            return res.status(200).json({ msg: "Email sent", success: true });
          });
        })
        .catch((err) => {
          return res.status(400).json({ msg: err.message, success: false });
        });
    })
    .catch((err) => {
      return res.status(400).json({ msg: err.message, success: false });
    });
};

router.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;
  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        if (Date.now() > expiresAt) {
          UserVerification.deleteOne({ userId })
            .then(() => {
              let message = "Link expired";
              res.redirect(`/verified/${message}`);
            })
            .catch((err) => {
              return res.redirect(`/verified/${err.message}`);
            });
        } else {
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                UserVerification.deleteOne({ userId })
                  .then(() => {
                    User.findOneAndUpdate(
                      { _id: userId },
                      { is_authenticated: true }
                    )
                      .then(() => {
                        UserVerification.deleteOne({ userId })
                          .then(() => {
                            let message = "Email Verified";
                            return res.redirect(`/verified/${message}`);
                          })
                          .catch((err) => {
                            return res.redirect(`/verified/${err.message}`);
                          });
                      })
                      .catch((err) => {
                        return res.redirect(`/verified/${err.message}`);
                      });
                  })
                  .catch((err) => {
                    return res.redirect(`/verified/${err.message}`);
                  });
              } else {
                let message = "Link not valid";
                return res.redirect(`/verified/${message}`);
              }
            })
            .catch((err) => {
              return res.redirect(`/verified/${err.message}`);
            });
        }
      } else {
        let message = "Account has been verified already try logging in";
        return res.redirect(`/verified/${message}`);
      }
    })
    .catch((err) => {
      return res.redirect(`/verified/${err.message}`);
    });
});

router.get("/verified/:msg", (req, res) => {
  return res.send(`${req.params.msg}`);
});

module.exports = router;
