const Message = require("../models/Message");

// Send a message
exports.sendMessage = async (body) => {
  try {
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

exports.createWithDeliveredAndRead = async ({ body, receiverId }) => {
  try {
    body["deliveredTo"] = [
      {
        userId: receiverId,
        isDelivered: true,
        deliveredAt: new Date(),
      },
    ];
    body["readBy"] = [
      {
        userId: receiverId,
        isRead: true,
        readAt: new Date(),
      },
    ];
    const message = new Message(body);
    return await message.save();
  } catch (error) {
    console.error("Error saving message:", error);
  }
};

exports.createWithDelivered = async ({ body, receiverId }) => {
  try {
    body["deliveredTo"] = [
      {
        userId: receiverId,
        isDelivered: true,
        deliveredAt: new Date(),
      },
    ];
    const message = new Message(body);
    return await message.save();
  } catch (error) {
    console.error("Error saving message:", error);
  }
};
