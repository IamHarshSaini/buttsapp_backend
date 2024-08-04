const services = {
  get: async function (req) {
    return [{ name: "harsh", lastName: "saini" }];
  },
  add: async function (req) {
    return "added";
  },
  delete: async function (req) {
    return "deleted";
  },
  put: async function (req) {
    return "updated";
  },
};

module.exports = services;
