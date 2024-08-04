const socketIO = require("socket.io");
let io, socketInfo;

const newUserConnected = () => {
  console.log(`new user connected ${socketInfo?.id}`);
};

const sendMessage = (message) => {
  io.emit("message", message);
};

const scoket = (socket) => {
  // new user connected
  newUserConnected(socket);

  // setting global socket info
  socketInfo = socket;

  // events
  socket.on("sendMessage", sendMessage);

  // disconnect event
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
};

module.exports = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // app URL
    },
  });
  io.on("connection", scoket);
};
