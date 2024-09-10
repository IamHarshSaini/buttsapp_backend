const socketIO = require("socket.io");
const redis = require("../db/redis");
const { socketMiddleware } = require("../common/constant.js");

const {
  chatList,
  createNewChat,
  updateChatLastMessages,
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

// Handle user connection and disconnection
const handleUserConnectionAndDisconnection = async (socket, status) => {
  try {
    const { _id, name } = socket.user;
    if (status) {
      await redis.set(_id, socket.id);
      console.log(`${name} Connected`);
    } else {
      await redis.del(_id);
      console.log(`${name} Disconnected`);
    }
    // Update user status and notify contacts
    const contacts = await getUserContacts(_id);
    await setOnlineOrOffline(_id, status);

    const lastSeen = Date.now();
    // const contactPromises = contacts.map(async (contact) => {
    //   try {
    //     const isUserOnline = await redis.get(contact);
    //     if (isUserOnline) {
    //       io.to(isUserOnline).emit("userStatusUpdate", {
    //         userId: _id,
    //         status: status,
    //         lastSeen: lastSeen,
    //       });
    //     }
    //   } catch (err) {
    //     console.error(`Error notifying contact ${contact}:`, err);
    //   }
    // });
    // await Promise.all(contactPromises);
  } catch (e) {
    console.log(e);
  }
};

// Handle sending messages
const handleSendMessage = (socket) => async (data, callback) => {
  const { _id } = socket.user;
  const { message: content, chatId, type, receiverId, isGroup } = data;
  let message = await sendMessage({
    senderId: _id,
    chatId,
    content,
    type,
  });

  if (!isGroup) {
    if (await redis.get(receiverId)) {
      message = await markAsDelivered(message._id, receiverId);
    }
  } else {
  }

  const updatedChat = await updateChatLastMessages(chatId, message._id);
  io.to(chatId).emit("message", { message, updatedChat });
};

// Handle retrieving chat messages
const handleGetChatMessages = (socket) => async (chatId, callback) => {
  socket.join(chatId);
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
  // socket.on("createNewChat", handleCreateNewChat(socket));
  socket.on("getAllUserList", handleGetAllUserList(socket));
  socket.on("getChatMessages", handleGetChatMessages(socket));
  // socket.on("markAsRead", handleMarkAsRead(socket));
  // socket.on("markAllAsRead", handleMarkAllAsRead(socket));

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
