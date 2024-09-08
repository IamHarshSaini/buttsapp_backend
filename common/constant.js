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

exports.socketMiddleware = (socket, next) => {
  try {
    if (socket?.handshake?.query?.token) {
      const decoded = jwtDecode(socket.handshake.query.token);
      if (decoded?.email) {
        socket['user'] = decoded;
        next();
      } else {
        throw new Error('not authorized');
      }
    } else {
      throw new Error('not authorized');
    }
  } catch (error) {
    console.log(error);
    const err = new Error('not authorized');
    err.data = { content: 'Please login first' };
    next(err);
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
