const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    dp: { type: String },
    password: { type: String },
    lastSeen: { type: String },
    isSocial: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
