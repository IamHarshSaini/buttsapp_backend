const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");

exports.jwtDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return error;
  }
};

exports.jwtEncode = (details) => {
  try {
    return jwt.sign(JSON.stringify(details), "shh");
  } catch (error) {
    return error;
  }
};
