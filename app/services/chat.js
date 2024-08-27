const ChatModel = require('../models/Chat');
const { tryCatch } = require('../../common/constant');
const { addNewUserToContactList } = require('./auth');
const { sendMessage, getChatMessage } = require('./message');

exports.chatMessage = tryCatch(async (senderId, receiverId) => {
  let chat = await ChatModel.find({ members: receiverId });
  if (chat?.length > 0) {
    return getChatMessage(chat?.[0]._id);
  } else {
    return [];
  }
});

exports.sendOneToOneMessage = tryCatch(async (userId, receiverId, message, type) => {
  await addNewUserToContactList(userId, receiverId);
  let chat = await ChatModel.find({ members: receiverId });
  if (chat.length > 0) {
    return await sendMessage({ senderId: userId, chatId: chat[0]._id, content: message, type: type || 'text' });
  } else {
    let newChat = await new ChatModel({ members: [userId, receiverId] });
    await newChat.save();
    return await sendMessage({ senderId: userId, chatId: newChat._id, content: message, type: type || 'text' });
  }
});

exports.chatList = tryCatch(async (id) => {
  let chatsList = await ChatModel.find({ members: id }).populate('members').populate("lastMessage");
  return chatsList;
});
