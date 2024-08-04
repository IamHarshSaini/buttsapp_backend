'use strict';
const mongoose = require('mongoose');

var url = process.env.MongoUrl;

var mongoConn = mongoose.connect(url).then(() => {
    console.log("Database Connected");
}).catch((err) => {
    console.log(err);
})

module.exports = mongoConn;