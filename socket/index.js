let io;
const socketIO = require('socket.io');
const { jwtDecode } = require('../common/constant.js');
const { chatMessage } = require('../app/services/chat.js');
const { setOnlineOrOffline, getAll } = require('../app/services/auth.js');

let userList = {};

const scoketFnc = async (socket) => {
  // new user connected
  const { name, _id } = socket['user'];
  userList[_id] = socket.id;
  console.log(`${name} Connected`);
  await setOnlineOrOffline(_id, true);

  // sendMessage
  socket.on('sendMessage', async ({ id, message }) => {
    // if (userList?.[id]) {
    //   io.to(userList[id]).emit("message", message);
    // }
    // await controller.add({
    //   body: {
    //     sender: _id,
    //     receiver: id,
    //     content: message,
    //   },
    // });
  });

  // chatMessages
  socket.on('chatMessages', async (id, callback) => {
    // let chatMessages = chatMessage(_id, id);
    callback([]);
  });

  // chatList
  socket.on('chatList', async (callBack) => {
    // let list = await authServices.get(_id);
    callBack([]);
  });

  socket.on('getAllUserList', async (callBack) => {
    let list = await getAll(_id);
    callBack(list);
  });

  // disconnect event
  socket.on('disconnect', async () => {
    console.log(`${name} DisConnected`);
    await setOnlineOrOffline(_id, false);
    delete userList[_id];
  });
};

const middleware = (socket, next) => {
  try {
    if (socket?.handshake?.query?.token) {
      const decoded = jwtDecode(socket.handshake.query.token);
      if (decoded?.email) {
        socket['user'] = decoded;
        next();
      } else {
        throw 'not authorized';
      }
    }
  } catch (error) {
    console.log(error);
    const err = new Error('not authorized');
    err.data = { content: 'Please login first' };
    next(err);
  }
};

module.exports = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // app URL
    },
  });
  io.use(middleware);
  io.on('connection', scoketFnc);
};
