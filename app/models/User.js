const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    lastSeen: Date.now(),
    avatar: { type: String },
    password: { type: String },
    lastSeen: { type: String },
    isSocial: { type: Boolean },
    userName: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
