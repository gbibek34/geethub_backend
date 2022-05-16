const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');

const app = express();
app.use(express.json());
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

app.use(cors());
app.options('*', cors());
app.listen(3000);
