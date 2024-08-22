const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema(
  {
    name: { type: String, required: true },
    groupPicture: { type: String, default: "" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    description: { type: String, default: "Group chat" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
