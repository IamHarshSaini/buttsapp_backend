let io;
const socketIO = require("socket.io");
const controller = require("../app/controllers/message.js");
const { jwtDecode } = require("../common/constant.js");

let userList = {};

const scoketFnc = (socket) => {
  // new user connected
  const { userName, _id } = socket["user"];

  userList[_id] = socket.id;
  console.log(`${userName} Connected`);

  // events
  socket.on("sendMessage", async ({ id, message }) => {
    io.to(userList[id]).emit("message", message);
    await controller.add({
      body: {
        sender: _id,
        receiver: id,
        content: message,
      },
    });
  });

  // socket.on("getUserChat", id, async (e) => {
  //   let msg = await Message.find();
  //   console.log(id);
  //   e(msg);
  // });

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
