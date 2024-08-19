const Message = require("../models/Message");

const services = {
  get: async (req) => {
    try {
      const { receiver, sender } = req.query;
      let msgs = await Message.find({
        $or: [
          { sender: sender, receiver: receiver },
          { receiver: sender, sender: receiver },
        ],
      }).limit(10);
      return msgs;
    } catch (error) {
      throw error;
    }
  },
  add: async (req) => {
    try {
      let msg = new Message(req.body);
      return await msg.save();
    } catch (error) {
      throw error;
    }
  },
};

module.exports = services;
