const userModel = require("../models/User");
const { expressTryCatch } = require("../../common/constant");
let userSelect = "-isVerified -createdAt -updatedAt -contacts -groups";

exports.getAll = expressTryCatch(async function (id) {
  try {
    if (id) {
      return (users = await userModel
        .find({ _id: { $ne: id } })
        .select(userSelect));
    } else {
      return (users = await userModel.find().select(userSelect));
    }
  } catch (error) {
    return error.message;
  }
});

exports.add = expressTryCatch(async function (body) {
  if (!body?.email) throw "email is required!";
  let user = await userModel.findOne({ email: body.email }).select(userSelect);
  if (user) {
    return user;
  } else {
    let newUser = new userModel(body);
    await newUser.save();
    return newUser;
  }
});

exports.setOnlineOrOffline = async (id, status) => {
  try {
    let body = {
      isOnline: status,
    };
    if (!status) {
      body["lastSeen"] = Date.now();
    }
    return await userModel.findByIdAndUpdate(id, body);
  } catch (error) {
    return error;
  }
};

exports.addNewUserToContactList = async (userId, contactId) => {
  try {
    const currentUser = await userModel.findById(userId);
    const newContact = await userModel.findById(contactId);
    if (!currentUser || !newContact) {
      return "User not found";
    }
    if (currentUser.contacts.includes(contactId)) {
      return "User is already in contacts";
    }
    currentUser.contacts.push(contactId);
    await currentUser.save();
    return {
      message: "Contact added successfully",
      contacts: currentUser.contacts,
    };
  } catch (error) {
    console.log(error);
  }
};

exports.getUserContacts = async (id) => {
  try {
    let user = await userModel.findOne({ _id: id }).select("contacts");
    return user?.contacts || [];
  } catch (error) {
    console.log(error);
  }
};
