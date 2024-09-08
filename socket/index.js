const socketIO = require("socket.io");
const { socketMiddleware } = require("../common/constant.js");

const {
  chatList,
  updateChat,
  createNewChat,
  findChatByIdAndExcludeUserById,
} = require("../app/services/chat.js");

const {
  getAll,
  getUserContacts,
  setOnlineOrOffline,
} = require("../app/services/auth.js");

const {
  markAsRead,
  sendMessage,
  getChatMessage,
  markAsDelivered,
} = require("../app/services/message.js");

let io;
let userList = {};

// Handle user connection and disconnection
const handleUserConnectionAndDisconnection = async (socket, status) => {
  const { _id, name } = socket.user;

  if (status) {
    userList[_id] = socket.id;
    console.log(`${name} Connected`);
  } else {
    delete userList[_id];
    console.log(`${name} Disconnected`);
  }

  try {
    // Update user status and notify contacts
    const { contacts } = await getUserContacts(_id);
    await setOnlineOrOffline(_id, status);

    contacts.forEach((contact) => {
      if (userList[contact]) {
        io.to(userList[contact]).emit("userStatusUpdate", {
          userId: _id,
          status: status,
          lastSeen: Date.now(),
        });
      }
    });
  } catch (e) {}
};

// Handle sending messages
const handleSendMessage = (socket) => async (data, callback) => {
  const { _id } = socket.user;
  const { message: content, chatId, type, receiverId } = data;
  const message = await sendMessage({
    senderId: _id,
    chatId,
    content,
    type,
  });
  const updatedChat = await updateChat(chatId, _id, message._id);

  if (userList[receiverId]) {
    const updatedChatForReceiver = await findChatByIdAndExcludeUserById(
      chatId,
      receiverId
    );
    const updatedMessage = await markAsDelivered(message._id, receiverId);
    io.to(userList[receiverId]).emit("message", {
      message,
      updatedChat: updatedChatForReceiver,
    });

    callback({
      message: updatedMessage,
      updatedChat,
    });
  } else {
    callback({
      message,
      updatedChat,
    });
  }
};

// Handle retrieving chat messages
const handleGetChatMessages = (socket) => async (chatId, callback) => {
  const chatMessages = await getChatMessage(chatId);
  callback(chatMessages || []);
};

// Handle creating a new chat
const handleCreateNewChat = (socket) => async (receiverId, callback) => {
  const chat = await createNewChat(socket.user._id, receiverId);
  const messages = await getChatMessage(chat._id);
  callback({
    chat,
    messages,
  });
};

// Handle retrieving chat list
const handleChatList = (socket) => async (callback) => {
  const list = await chatList(socket.user._id);
  callback(list || []);
};

// Handle retrieving all users list
const handleGetAllUserList = (socket) => async (callback) => {
  const list = await getAll(socket.user._id);
  callback(list);
};

const handleMarkAsRead = (socket) => async (messageId, userId, senderId) => {
  let message = await markAsRead(messageId, userId);
  if (userList[senderId]) {
    io.to(userList[senderId]).emit("updateMessage", message);
  }
};

const handleMarkAllAsRead = () => async (callBack) => {
  // const { _id } = socket.user;
};

// Main handler for all socket connections
const handleConnections = (socket) => {
  // Handle user connection on initial connect
  handleUserConnectionAndDisconnection(socket, true);

  // Bind socket events to handlers
  socket.on("chatList", handleChatList(socket));
  socket.on("sendMessage", handleSendMessage(socket));
  socket.on("createNewChat", handleCreateNewChat(socket));
  socket.on("getAllUserList", handleGetAllUserList(socket));
  socket.on("getChatMessages", handleGetChatMessages(socket));
  socket.on("markAsRead", handleMarkAsRead(socket));
  socket.on("markAllAsRead", handleMarkAllAsRead(socket));

  // Handle disconnection event
  socket.on("disconnect", () =>
    handleUserConnectionAndDisconnection(socket, false)
  );
};

// Socket.io setup
module.exports = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // Allow all origins, can be restricted to specific URLs
    },
  });

  io.use(socketMiddleware);
  io.on("connection", handleConnections);
};
