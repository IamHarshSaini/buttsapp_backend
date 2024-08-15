const userModel = require("../models/User");

const services = {
  get: async function (req) {
    return [{ name: "harsh", lastName: "saini" }];
  },
  add: async function (req) {
    try {
      const { body } = req;
      let user = await userModel.findOne({ email: body.email });
      if (user) {
        return user;
      } else {
        let newUser = new userModel(body);
        return await newUser.save();
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
