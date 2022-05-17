const express = require('express');
const router = express.Router();
const mongoose = require("mongoose")
const User = mongoose.model("User")

router.get('/signup', (req, res) => {
  res.send("hello");
})

router.post('/signup', (req, res) => {
  var { username, email, password } = req.body
  console.log(req.body)
  if (!username || !email || !password) {
    return res.status(422).json({ error: "Add all data" })
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "User already exists with that email" })
      }
      const user = new User({
        email,
        password,
        username,
      })
      user.save()
        .then((user) => {
          res.json({ message: "Saved Successfully" })
          console.log(user.email)
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
})

module.exports = router