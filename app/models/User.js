const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    isSocial: { type: Boolean },
    password: { type: String },
    name: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    phoneNumber: { type: String, unique: false },
    isVerified: { type: Boolean, default: false },
    profilePicture: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    contacts: [{ type: Schema.Types.ObjectId, ref: "User" }],
    about: { type: String, default: "Hey there! I am using WhatsApp." },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
