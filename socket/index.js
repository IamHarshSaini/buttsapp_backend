const redis = require("../db/redis");
const socketIO = require("socket.io");
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
  sendMessage,
  getChatMessage,
  createWithDelivered,
  createWithDeliveredAndRead,
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

    // const lastSeen = Date.now();
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
    //     console.log(`Error notifying contact ${contact}:`, err);
    //   }
    // });
    // await Promise.all(contactPromises);
  } catch (e) {
    console.log(e);
  }
};

// Handle sending messages
const handleSendMessage =
  (socket) =>
  async ({ message: content, chatId, type, receiverId, isGroup }) => {
    try {
      const { _id } = socket.user;
      let message = null;
      let updatedChat = null;

      let messageBody = {
        sender: _id,
        chat: chatId,
        content,
        type,
      };

      const [hasUserOpenedSameChatRes, isUserOnline] = await Promise.all([
        hasUserOpenedSameChat(receiverId, chatId),
        redis.get(receiverId),
      ]);

      if (!isGroup) {
        if (hasUserOpenedSameChatRes) {
          message = await createWithDeliveredAndRead({
            body: messageBody,
            receiverId,
          });

          updatedChat = await updateChatLastMessages(chatId, message._id);
          io.to(chatId).emit("message", { message, updatedChat });

          console.log(updatedChat)

        } else if (isUserOnline) {
          message = await createWithDelivered({
            body: messageBody,
            receiverId,
          });
        } else {
          message = await sendMessage(messageBody);
        }
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

// Handle retrieving chat messages
const handleGetChatMessages = (socket) => async (chatId, callback) => {
  try {
    socket.join(chatId);
    const chatMessages = await getChatMessage(chatId);
    callback(chatMessages || []);
  } catch (error) {
    console.log(error);
  }
};

// Handle creating a new chat
const handleCreateNewChat = (socket) => async (receiverId, callback) => {
  try {
    const chat = await createNewChat(socket.user._id, receiverId);
    const messages = await getChatMessage(chat._id);
    callback({
      chat,
      messages,
    });
  } catch (error) {
    console.log(error);
  }
};

// Handle retrieving chat list
const handleChatList = (socket) => async (callback) => {
  try {
    const list = await chatList(socket.user._id);
    callback(list || []);
  } catch (error) {
    console.log(error);
  }
};

// Handle retrieving all users list
const handleGetAllUserList = (socket) => async (callback) => {
  try {
    const list = await getAll(socket.user._id);
    callback(list);
  } catch (error) {
    console.log(error);
  }
};

const handleMarkAllAsRead = () => async (callBack) => {
  try {
    // const { _id } = socket.user;
  } catch (error) {
    console.log(error);
  }
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

const hasUserOpenedSameChat = async (userId, chatId) => {
  let socketId = await redis.get(userId);
  if (socketId) {
    let users = io.sockets.adapter.rooms.get(chatId);
    if (users) {
      users = [...users];
      if (users.includes(socketId)) {
        return true;
      }
    }
  } else {
    return false;
  }
};
