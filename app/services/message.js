const Message = require("../models/Message");

const services = {
  get: async (req) => {
    const { receiver, sender } = req.query;
    let msgs = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { receiver: sender, sender: receiver },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10);
    return msgs;
  },
  add: async (body) => {
    let msg = new Message(body);
    return await msg.save();
  },
};

module.exports = services;
