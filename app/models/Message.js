const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "document"],
      default: "text",
    },
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    deliveredTo: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
      },
    ],
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
