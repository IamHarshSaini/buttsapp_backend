const redis = require("../db/redis");
const socketIO = require("socket.io");
const { socketMiddleware } = require("../common/constant.js");

const {
  chatList,
  createNewChat,
  updateChatLastMessages,
  updateChatLastMessagesAndUnReadCount,
} = require("../app/services/chat.js");

const {
  getAll,
  getUserContacts,
  setOnlineOrOffline,
} = require("../app/services/auth.js");

const { sendMessage, getChatMessage } = require("../app/services/message.js");

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
    const [contacts, updateStatus] = await Promise.all([
      getUserContacts(_id),
      setOnlineOrOffline(_id, status),
    ]);

    if (contacts?.length > 0) {
      const lastSeen = Date.now();
      const contactPromises = contacts.map(async (contact) => {
        try {
          const isUserOnline = await redis.get(contact?.toString());
          if (isUserOnline) {
            io.to(isUserOnline).emit("userStatusUpdate", {
              userId: _id,
              status: status,
              lastSeen: lastSeen,
            });
          }
        } catch (err) {
          console.log(`Error notifying contact ${contact}:`, err);
        }
      });
      await Promise.all(contactPromises);
    }
  } catch (e) {
    console.log(e);
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

// Handle sending messages
const handleSendMessage =
  (socket) =>
  async ({ message: content, chatId, type, receiverId, isGroup }) => {
    try {
      let messageBody = {
        sender: socket["user"]["_id"],
        chat: chatId,
        content,
        type,
      };

      const [hasUserOpenedSameChatRes, isUserOnline] = await Promise.all([
        hasUserOpenedSameChat(receiverId, chatId),
        redis.get(receiverId),
      ]);

      let message = await sendMessage({
        receiverId,
        isRead: hasUserOpenedSameChatRes,
        isDelivered: isUserOnline ? true : false,
        body: messageBody,
      });

      let updatedChat = null;
      if (hasUserOpenedSameChatRes) {
        updatedChat = await updateChatLastMessages(chatId, message._id);
      } else {
        updatedChat = await updateChatLastMessagesAndUnReadCount({
          chatId,
          messageId: message["_id"],
          receiverId,
        });``
      }

      io.to(chatId).emit("message", { message, updatedChat });

      if (isUserOnline && !hasUserOpenedSameChatRes) {
        io.to(isUserOnline).emit("updateChat", { updatedChat });
      }
    } catch (error) {
      console.log(error);
    }
  };

// Handle creating a new chat
const handleCreateNewChat = (socket) => async (receiverId, callback) => {
  try {
    const chat = await createNewChat(socket.user._id, receiverId);
    const chatId = chat["chat"]["_id"]?.toString();
    if (!chat["new"]) {
      const messages = await getChatMessage(chatId);
      callback({
        chat: chat.chat,
        messages,
      });
    } else {
      callback({
        chat: chat.chat,
        messages: [],
      });
    }
    socket.join(chatId);
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

// const handleMarkAllAsRead = () => async (callBack) => {
//   try {
//   } catch (error) {
//     console.log(error);
//   }
// };

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
