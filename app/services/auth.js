const userModel = require('../models/User');
const { tryCatch } = require('../../common/constant');
let userSelect = '-isVerified -createdAt -updatedAt -contacts -groups';

exports.getAll = tryCatch(async function (id) {
  try {
    let users = [];
    if (id) {
      users = await userModel.find({ _id: { $ne: id } }).select(userSelect);
    } else {
      users = await userModel.find().select(userSelect);
    }
    return users;
  } catch (error) {
    return error.message;
  }
});

exports.add = tryCatch(async function (body) {
  // if email is not found
  if (!body?.email) throw 'email is required!';

  // check if user already exists
  let user = await userModel.findOne({ email: body.email }).select(userSelect);

  if (user) {
    return user;
  } else {
    let newUser = new userModel(body);
    await newUser.save();
    return newUser;
  }
});

exports.setOnlineOrOffline = tryCatch(async (id, status) => {
  try {
    let body = {
      isOnline: status,
    };
    if (!status) {
      body['lastSeen'] = Date.now();
    }
    await userModel.findByIdAndUpdate(id, body);
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
});

exports.addNewUserToContactList = tryCatch(async (userId, contactId) => {
  try {
    // make sure both users exist
    const currentUser = await userModel.findById(userId);
    const newContact = await userModel.findById(contactId);

    if (!currentUser || !newContact) {
      return 'User not found';
    }

    // Check if the contact is already in the list
    if (currentUser.contacts.includes(contactId)) {
      return 'User is already in contacts';
    }

    // Add the new contact to the current user's contact list
    currentUser.contacts.push(contactId);
    await currentUser.save();

    return {
      message: 'Contact added successfully',
      contacts: currentUser.contacts,
    };
  } catch (error) {
    return error.message;
  }
});
