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
  async (...args) => {
    try {
      return await fnc(...args);
    } catch (error) {
      console.log({
        error: true,
        message: error.message || error,
      });
      const [, response] = args;
      if (response && typeof response.send === 'function') {
        response.send({
          error: true,
          message: error.message || error,
        });
      } else {
        return error.message || 'Server not working';
      }
    }
  };
