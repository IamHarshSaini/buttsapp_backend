let io;
const socketIO = require("socket.io");
const { jwtDecode } = require("jwt-decode");

let userList = {};

const scoketFnc = (socket) => {
  // new user connected
  const { userName, email } = socket["user"];

  userList[email] = socket.id;
  console.log(`${userName} Connected`);

  // events
  socket.on("sendMessage", ({ email, message }) => {
    io.to(userList[email]).emit("message", message);
  });

  // disconnect event
  socket.on("disconnect", () => {
    console.log(`${userName} DisConnected`);
  });
};

const middleware = (socket, next) => {
  try {
    if (socket?.handshake?.query?.token) {
      const decoded = jwtDecode(socket.handshake.query.token);
      if (decoded?.email) {
        socket["user"] = decoded;
        socket["user"]["socketID"] = socket.id;
        next();
      } else {
        throw "not authorized";
      }
    }
  } catch (error) {
    console.log(error);
    const err = new Error("not authorized");
    err.data = { content: "Please login first" };
    next(err);
  }
};

module.exports = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // app URL
    },
  });
  io.use(middleware);
  io.on("connection", scoketFnc);
};
