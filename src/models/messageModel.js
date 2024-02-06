const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ["user", "room"], required: true },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});

module.exports = mongoose.model("Message", messageSchema);
