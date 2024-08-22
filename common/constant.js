const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');

exports.jwtDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return error;
  }
};

exports.jwtEncode = (details) => {
  try {
    return jwt.sign(JSON.stringify(details), 'shh');
  } catch (error) {
    return error;
  }
};

exports.tryCatch =
  (fnc) =>
  (...args) => {
    try {
      return fnc(...args);
    } catch (error) {
      if (args?.[1]) {
        args?.[1]?.send({
          error: true,
          message: error.message || error,
        });
      } else {
        return error?.message || 'server not working';
      }
    }
  };
