const Message = require("../models/Message");
const { tryCatch } = require("../../common/constant");

// Send a message
exports.sendMessage = tryCatch(async (body) => {
  const message = new Message(body);
  await message.save();
  return message;
});

exports.getChatMessage = tryCatch(async (chatId) => {
  let msgs = await Message.find({ chat: chatId }).sort({ createdAt: -1 });
  return msgs || [];
});

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
