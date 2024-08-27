const { tryCatch } = require('../../common/constant');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

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

  // Update lastMessage in Chat
  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  return message;
});

exports.getChatMessage = tryCatch(async (chatId) => {
  let msgs = await Message.find({ chat: chatId }).sort({ createdAt: -1 });
  if (msgs) return msgs;
  return [];
});
