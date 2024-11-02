const Message = require("../models/Message");

// Send a message
exports.sendMessage = async ({ body, isDelivered, isRead, receiverId }) => {
  try {
    if (isRead) {
      body["readBy"] = [
        {
          userId: receiverId,
          isRead: true,
          readAt: new Date(),
        },
      ];
    } else if (isDelivered) {
      body["deliveredTo"] = [
        {
          userId: receiverId,
          isDelivered: true,
          deliveredAt: new Date(),
        },
      ];
    }
    const message = new Message(body);
    await message.save();
    return message;
  } catch (error) {
    console.error("Error saving message:", error);
  }
};

exports.getChatMessage = async (chatId) => {
  try {
    let msgs = await Message.find({ chat: chatId }).sort({ createdAt: -1 });
    return msgs;
  } catch (error) {
    console.error("Error getting message:", error);
  }
};
