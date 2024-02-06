const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ["user", "room"], required: true },
  // References the sender's Account document
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  // Optional: References the recipient's Account document for direct messages
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  // Optional: References the Room document for room messages
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});

module.exports = mongoose.model("Message", messageSchema);
