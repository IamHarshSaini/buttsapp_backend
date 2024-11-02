const ChatModel = require("../models/Chat");
const { addNewUserToContactList } = require("../services/auth");

exports.createNewChat = async (senderId, receiverId) => {
  try {
    const existingChat = await ChatModel.findOne({
      isGroup: false,
      members: { $all: [senderId, receiverId], $size: 2 },
    })
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
      });

    if (existingChat) {
      return { chat: existingChat, new: false };
    } else {
      let newChat = new ChatModel({ members: [senderId, receiverId] });
      await Promise.all([
        newChat.save(),
        addNewUserToContactList(senderId, receiverId),
        addNewUserToContactList(receiverId, senderId),
      ]);
      let chat = await ChatModel.findOne({
        _id: newChat._id,
      })
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
        });
      return { chat, new: true };
    }
  } catch (error) {
    console.log(error);
  }
};

exports.chatList = async (id) => {
  try {
    let chatsList = await ChatModel.find({
      members: id,
      lastMessage: { $ne: null },
    })
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
      .sort({ updatedAt: -1 });
    return chatsList;
  } catch (error) {
    console.log(error);
  }
};

exports.updateChatLastMessages = async (chatId, messageId) => {
  try {
    let updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      { lastMessage: messageId },
      { new: true }
    ).lean();
    return await ChatModel.findById(updatedChat["_id"])
      .populate({
        path: "members unreadCounts",
        select: ["name", "profilePicture", "isOnline", "lastSeen"],
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
      });
  } catch (error) {
    console.log(error);
  }
};

exports.updateChatLastMessagesAndUnReadCount = async ({
  chatId,
  messageId,
  receiverId,
}) => {
  try {
    let updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      { lastMessage: messageId },
      { new: true }
    ).lean();

    const userUnreadCount = updatedChat.unreadCounts.find(
      (count) => count?.userId?.toString() === receiverId
    );

    if (userUnreadCount) {
      await ChatModel.updateOne(
        { _id: chatId, "unreadCounts.userId": receiverId },
        { $inc: { "unreadCounts.$.count": 1 } }
      );
    } else {
      await ChatModel.updateOne(
        { _id: chatId },
        { $push: { unreadCounts: { userId: receiverId, count: 1 } } }
      );
    }

    return await ChatModel.findById(updatedChat["_id"])
      .populate({
        path: "members unreadCounts",
        select: ["name", "profilePicture", "isOnline", "lastSeen"],
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
      });
  } catch (error) {
    console.log(error);
  }
};
