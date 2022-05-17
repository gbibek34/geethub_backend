const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');

require ("./models/user")

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(require("./routes/authRoutes"))

app.use(express.urlencoded({ extended: true }));
require('./database/connection');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);

  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT,DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization'
  );
  next();
});

//here
app.get('/',(req,res)=>{
  res.send("hello world")
})

app.use(cors());
app.options('*', cors());
app.listen(PORT,()=>{
  console.log("Kore no server wa running on port:",PORT)
})
