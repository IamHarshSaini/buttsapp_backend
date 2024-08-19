const services = require("../services/message");

const controller = {
  get: async (req, res) => {
    try {
      let response = await services.get(req);
      res.send(response);
    } catch (error) {
      res.send(error);
    }
  },
  add: async (req, res) => {
    try {
      let response = await services.add(req);
      if(res?.send){
        res.send(response);
      }
    } catch (error) {
      res.send(error);
    }
  },
};
module.exports = controller;
