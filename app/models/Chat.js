const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    isGroup: { type: Boolean, default: false },
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    unreadCounts: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', ChatSchema);
