const mongoose = require('mongoose');
const ChatModel = require('../models/Chat');
const { getChatMessage } = require('./message');
const { tryCatch } = require('../../common/constant');
const { addNewUserToContactList } = require('./auth');

exports.chatMessage = tryCatch(async ({ senderId, receiverId }) => {
  // if (chatId) {
  //   return await getChatMessage(chatId);
  // } else {
  //   await addNewUserToContactList(senderId, receiverId);
  //   let newChat = new ChatModel({ members: [senderId, receiverId] });
  //   await newChat.save();
  //   let newUserChat = await ChatModel.findOne({ _id: newChat?._id }).populate({
  //     path: 'members',
  //     select: ['name', 'profilePicture'],
  //     match: { _id: { $ne: senderId } },
  //   });
  //   return newUserChat;
  // }
});

exports.createNewChat = tryCatch(async (senderId, receiverId) => {
  const existingChat = await ChatModel.findOne({
    isGroup: false,
    members: { $all: [senderId, receiverId], $size: 2 },
  });
  if (existingChat) {
    let messages = await getChatMessage(existingChat._id);
    return {
      chat: existingChat,
      messages: messages,
    };
  } else {
    let newChat = new ChatModel({ members: [senderId, receiverId] });
    await newChat.save();
    let newChatResponse = await ChatModel.findOne({ _id: newChat?._id }).populate({
      path: 'members',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: senderId } },
    });

    return {
      chat: newChatResponse,
      messages: [],
    };
  }
});

exports.chatList = tryCatch(async (id) => {
  // lastMessage: { $ne: null }
  let chatsList = await ChatModel.find({ members: id })
    .populate({
      path: 'members',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: id }, isGroup: false },
    })
    .populate({
      path: 'lastMessage',
      select: ['status', 'type', 'content', 'createdAt'],
      populate: {
        path: 'sender',
        select: ['name'],
        match: { isGroup: true },
      },
    })
    .populate({
      path: 'group',
      select: ['groupPicture', 'name'],
      match: { isGroup: true },
    })
    .populate({
      path: 'unreadCounts',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: id } },
    });

  return chatsList;
});
