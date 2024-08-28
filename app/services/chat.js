const ChatModel = require('../models/Chat');
const { getChatMessage } = require('./message');
const { tryCatch } = require('../../common/constant');
const { addNewUserToContactList } = require('./auth');

exports.chatMessage = tryCatch(async ({ senderId, receiverId, chatId }) => {
  let chat = await ChatModel.findOne({ _id: chatId });
  if (chat) {
    return await getChatMessage(chatId);
  } else {
    await addNewUserToContactList(senderId, receiverId);
    let newChat = new ChatModel({ members: [senderId, receiverId] });
    await newChat.save();
    let selectedChat = await ChatModel.findOne({ _id: newChat?._id }).populate({
      path: 'members',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: senderId } },
    });
    return selectedChat;
  }
});

exports.chatList = tryCatch(async (id) => {
  let chatsList = await ChatModel.find({ members: id })
    .populate({
      path: 'members',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: id } },
    })
    .populate({
      path: 'lastMessage',
      select: ['status', 'type', 'content', 'createdAt'],
      populate: {
        path: 'sender',
        select: ['name'],
      },
    })
    .populate('group', ['groupPicture', 'name'])
    .populate({
      path: 'unreadCounts',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: id } },
    });
  return chatsList;
});
