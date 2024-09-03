const ChatModel = require('../models/Chat');
const { getChatMessage } = require('./message');
const { tryCatch } = require('../../common/constant');
const { addNewUserToContactList } = require('./auth');

exports.createNewChat = tryCatch(async (senderId, receiverId) => {
  const existingChat = await ChatModel.findOne({
    isGroup: false,
    members: { $all: [senderId, receiverId], $size: 2 },
  })
    .select('isGroup lastMessage, unreadCounts')
    .populate({
      path: 'members',
      select: ['name', 'profilePicture', 'isOnline', 'lastSeen'],
      match: { _id: { $ne: senderId } },
    })
    .populate({
      path: 'unreadCounts',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: senderId } },
    })
    .exec();
  if (existingChat) {
    let chatInfo = existingChat.toObject();
    if (!chatInfo?.isGroup) {
      chatInfo['chatMember'] = chatInfo['members'][0];
    }
    delete chatInfo['members'];
    let messages = await getChatMessage(existingChat._id);

    return {
      chat: chatInfo,
      messages: messages,
    };
  } else {
    addNewUserToContactList(senderId, receiverId);
    addNewUserToContactList(receiverId, senderId);
    let chatInfo = await new ChatModel({ members: [senderId, receiverId] }).save().then((newChat) =>
      ChatModel.findOne({ _id: newChat._id })
        .select('isGroup lastMessage unreadCounts')
        .populate({
          path: 'members',
          select: ['name', 'profilePicture', 'isOnline', 'lastSeen'],
          match: { _id: { $ne: senderId } },
        })
        .populate({
          path: 'unreadCounts',
          select: ['name', 'profilePicture'],
          match: { _id: { $ne: senderId } },
        })
        .exec()
    );

    if (!chatInfo?.isGroup) {
      chatInfo['chatMember'] = chatInfo['members'][0];
    }
    delete chatInfo['members'];

    return {
      chat: chatInfo,
      messages: [],
    };
  }
});

exports.chatList = tryCatch(async (id) => {
  let chatsList = await ChatModel.find({ members: id, lastMessage: { $ne: null } })
    .select('isGroup lastMessage, unreadCounts')
    .populate({
      path: 'members',
      select: ['name', 'profilePicture', 'isOnline', 'lastSeen'],
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
    .populate({
      path: 'group',
      select: ['groupPicture', 'name'],
    })
    .populate({
      path: 'unreadCounts',
      select: ['name', 'profilePicture'],
      match: { _id: { $ne: id } },
    })
    .exec();

  let transformedChatsList = chatsList.map((item) => {
    let obj = item.toObject();
    if (!obj?.isGroup) {
      obj['chatMember'] = obj['members'][0];
    }
    delete obj['members'];
    return obj;
  });

  return transformedChatsList;
});
