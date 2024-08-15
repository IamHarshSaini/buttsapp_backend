"use strict";
const mongoose = require("mongoose");

const connection = mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = connection;
