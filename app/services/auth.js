const userModel = require("../models/User");

const services = {
  get: async function (req) {
    let users = await userModel
      .find({ _id: { $ne: req.user._id } })
      .select({ avatar: 1, userName: 1, email: 1, isSocial: 1 });
    return users;
  },
  add: async function (req) {
    try {
      const { body } = req;
      if (!body?.email) throw "email is required!";
      let user = await userModel
        .findOne({ email: body.email })
        .select({ userName: 1, email: 1, avatar: 1, isSocial: 1 });
      if (user) {
        return user;
      } else {
        let newUser = new userModel(body);
        await newUser.save();
        return { ...body, _id: newUser._id };
      }
    } catch (error) {
      throw error;
    }
  },
  delete: async function (req) {
    return "deleted";
  },
  put: async function (req) {
    return "updated";
  },
};

module.exports = services;
