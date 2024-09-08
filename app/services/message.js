const Message = require("../models/Message");
const { tryCatch } = require("../../common/constant");

// Send a message
exports.sendMessage = tryCatch(async (body) => {
  const { senderId, chatId, content, type } = body;
  const message = new Message({
    sender: senderId,
    chat: chatId,
    content,
    type,
  });
  await message.save();
  return message;
});

exports.getChatMessage = tryCatch(async (chatId) => {
  let msgs = await Message.find({ chat: chatId }).sort({ createdAt: -1 });
  return msgs || [];
});

exports.markAsDelivered = tryCatch(async (messageId, userId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        deliveredTo: {
          userId: userId,
          isDelivered: true,
          deliveredAt: new Date(),
        },
      },
    },
    { new: true }
  );
});

exports.markAsRead = tryCatch(async (messageId, userId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        readBy: {
          userId: userId,
          isRead: true,
          readAt: new Date(),
        },
      },
    },
    { new: true }
  );
});
