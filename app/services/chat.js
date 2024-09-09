const ChatModel = require("../models/Chat");
const { tryCatch } = require("../../common/constant");
const { addNewUserToContactList } = require("./auth");

exports.createNewChat = tryCatch(async (senderId, receiverId) => {
  const existingChat = await ChatModel.findOne({
    isGroup: false,
    members: { $all: [senderId, receiverId], $size: 2 },
  })
    .select("isGroup lastMessage, unreadCounts")
    .populate({
      path: "members unreadCounts",
      select: ["name", "profilePicture", "isOnline", "lastSeen"],
      match: { _id: { $ne: senderId } },
    })
    .exec();
  if (existingChat) {
    let chatInfo = existingChat.toObject();
    if (!chatInfo?.isGroup) {
      chatInfo["chatMember"] = chatInfo["members"][0];
    }
    delete chatInfo["members"];
    return chatInfo;
  } else {
    let newChat = new ChatModel({ members: [senderId, receiverId] });
    await newChat.save();
    let chatInfo = await ChatModel.findOne({ _id: newChat._id })
      .select("isGroup lastMessage unreadCounts")
      .populate({
        path: "members unreadCounts",
        select: ["name", "profilePicture", "isOnline", "lastSeen"],
        match: { _id: { $ne: senderId } },
      })
      .exec();

    chatInfo = chatInfo.toObject();
    if (!chatInfo?.isGroup) {
      chatInfo["chatMember"] = chatInfo["members"][0];
    }
    delete chatInfo["members"];
    await Promise.all([
      addNewUserToContactList(senderId, receiverId),
      addNewUserToContactList(receiverId, senderId),
    ]);
    return chatInfo;
  }
});

exports.chatList = tryCatch(async (id) => {
  // let chatsList = await ChatModel.find({
  //   members: id,
  //   lastMessage: { $ne: null },
  // })
  //   .select("isGroup lastMessage, unreadCounts")
  //   .populate({
  //     path: "members unreadCounts",
  //     select: ["name", "profilePicture", "isOnline", "lastSeen"],
  //     match: { _id: { $ne: id } },
  //   })
  //   .populate({
  //     path: "lastMessage",
  //     select: ["status", "type", "content", "createdAt"],
  //     populate: {
  //       path: "sender",
  //       select: ["name"],
  //     },
  //   })
  //   .populate({
  //     path: "group",
  //     select: ["groupPicture", "name"],
  //   })
  //   .sort({ updatedAt: -1 })
  //   .exec();

  // let transformedChatsList = chatsList.map((item) => {
  //   let obj = item.toObject();
  //   if (!obj?.isGroup) {
  //     obj["chatMember"] = obj["members"][0];
  //   }
  //   delete obj["members"];
  //   return obj;
  // });

  // return transformedChatsList;

  let chatLists = await ChatModel.aggregate([
    {
      $match: {
        members: id,
        lastMessage: { $ne: null },
      },
    },
  ]);
  return chatLists;
});

exports.updateChat = tryCatch(async (chatId, senderId, messageId) => {
  let chat = await ChatModel.findByIdAndUpdate(
    chatId,
    { lastMessage: messageId },
    { new: true }
  )
    .select("isGroup lastMessage, unreadCounts")
    .populate({
      path: "members unreadCounts",
      select: ["name", "profilePicture", "isOnline", "lastSeen"],
      match: { _id: { $ne: senderId } },
    })
    .populate({
      path: "lastMessage",
      select: ["status", "type", "content", "createdAt"],
      populate: {
        path: "sender",
        select: ["name"],
      },
    })
    .populate({
      path: "group",
      select: ["groupPicture", "name"],
    })
    .exec();

  chat = chat.toObject();
  if (!chat?.isGroup) {
    chat["chatMember"] = chat["members"][0];
  }
  delete chat["members"];
  return chat;
});

exports.findChatByIdAndExcludeUserById = tryCatch(async (chatId, id) => {
  let chatInfo = await ChatModel.findById(chatId)
    .select("isGroup lastMessage, unreadCounts")
    .populate({
      path: "members unreadCounts",
      select: ["name", "profilePicture", "isOnline", "lastSeen"],
      match: { _id: { $ne: id } },
    })
    .populate({
      path: "lastMessage",
      select: ["status", "type", "content", "createdAt"],
      populate: {
        path: "sender",
        select: ["name"],
      },
    })
    .populate({
      path: "group",
      select: ["groupPicture", "name"],
    })
    .exec();

  chatInfo = chatInfo.toObject();
  if (!chatInfo?.isGroup) {
    chatInfo["chatMember"] = chatInfo["members"][0];
  }
  delete chatInfo["members"];
  return chatInfo;
});
