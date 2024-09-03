let io;
const socketIO = require('socket.io');
const { jwtDecode } = require('../common/constant.js');
const { chatList, createNewChat } = require('../app/services/chat.js');
const { sendMessage, getChatMessage } = require('../app/services/message.js');
const { setOnlineOrOffline, getAll, getUserContacts } = require('../app/services/auth.js');

let userList = {};

const scoketFnc = async (socket) => {
  // new user connected
  const { name, _id } = socket['user'];
  userList[_id] = socket.id;
  console.log(`${name} Connected`);

  // update user status
  let { contacts } = await getUserContacts(_id);
  let useDetails = await setOnlineOrOffline(_id, true);
  contacts.forEach(user => {
    if (userList[user]) {
      io.to(userList[user]).emit('userStatusUpdate', { userId: _id, info: useDetails });
    }
  });

  // sendMessage
  socket.on('sendMessage', async ({ message, chatId, type, receiverId }, call) => {
    let msg = await sendMessage({ senderId: _id, chatId, content: message, type });
    call(msg);
    if (userList?.[receiverId]) {
      io.to(userList[receiverId]).emit('message', msg);
    }
  });

  // chatMessages
  socket.on('getChatMessages', async (id, callback) => {
    let chatMessages = await getChatMessage(id);
    callback(chatMessages || []);
  });

  // create new chat
  socket.on('createNewChat', async (receiverId, callBack) => {
    let result = await createNewChat(_id, receiverId);
    callBack(result);
  });

  // chatList
  socket.on('chatList', async (callBack) => {
    let list = await chatList(_id);
    callBack(list || []);
  });

  // all users list
  socket.on('getAllUserList', async (callBack) => {
    let list = await getAll(_id);
    callBack(list);
  });

  // disconnect event
  socket.on('disconnect', async () => {
    console.log(`${name} DisConnected`);
    delete userList[_id];

    // update user status
    let { contacts } = await getUserContacts(_id);
    let useDetails = await setOnlineOrOffline(_id, true);
    contacts.forEach(user => {
      if (userList[user]) {
        io.to(userList[user]).emit('userStatusUpdate', { userId: _id, info: useDetails });
      }
    });
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
