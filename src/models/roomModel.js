const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
});

module.exports = mongoose.model("Room", roomSchema);
