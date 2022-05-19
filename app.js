require("dotenv").config();
const express = require("express");
var cors = require("cors");
const connection = require("./database/connection");

require("./models/userModel");
require("./models/userVerificationModel");

connection();

const app = express();
app.use(express.json());
app.use(require("./routes/authRoutes"));

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);

  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

//here
app.get("/", (req, res) => {
  res.send("hello world");
});

app.use(cors());
app.options("*", cors());
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
