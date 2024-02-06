const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const morgan = require("morgan");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(morgan("dev"));
app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const accountRouter = require("./src/routes/accountRouter");

app.use("/api/accounts", accountRouter);

const MessageModel = require("./src/models/messageModel");
const accountModel = require("./src/models/accountModel");
const roomModel = require("./src/models/roomModel");

mongoose.connect("mongodb://0.0.0.0:27017/chat-app", {});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/public/index.html");
});

app.get("/edit", (req, res) => {
  res.sendFile(__dirname + "/src/public/edit.html");
});

try {
  io.on("connection", async (socket) => {
    console.log("A user connected");

    socket.on("join", async ({ type, roomId, userId }) => {
      try {
        if (!roomId) return;

        socket.join(roomId);

        console.log(`join: ${roomId} as user: ${userId}`);

        let messages;

        if (type === "room") {
          const newRoomId = await roomModel.find({ roomId });
          messages = await MessageModel.find({ room: newRoomId }).populate(
            "account"
          );
          console.log(messages);
        } else {
          const reciverAccountId = await accountModel.findOne({
            username: roomId,
          });
          const senderAccountId = await accountModel.findOne({
            username: userId,
          });

          messages = await MessageModel.find({
            recipient: reciverAccountId._id,
            account: senderAccountId._id,
          });
        }

        const initMessages = messages.map((m) => ({
          message: m.message,
          username: m.account.username,
        }));

        socket.emit("init messages", initMessages);
      } catch (e) {
        console.error("Error joining room:", e);
      }
    });

    socket.on("new message", async (data) => {
      try {
        const { message, username, type, roomId, recipientId } = data;

        console.log("new message", data);
        const room =
          type === "room" ? await roomModel.findOne({ roomId }) : null;

        const account = await accountModel.findOne({ username });

        let newMessage = await MessageModel.create({
          message,
          account: account._id,
          type,
          room: room ? room._id : null,
          recipient: type === "direct" ? recipientId : null,
        });

        newMessage = await newMessage.populate("account", "username");

        if (type === "room") {
          console.log("new message is sent", newMessage.message);
          io.to(roomId).emit("chat message", {
            message: newMessage.message,
            username: newMessage.account.username,
          });
        } else {
          socket.emit("chat message", {
            message: newMessage.message,
            username: newMessage.account.username,
          });
        }
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
} catch (e) {
  console.log(e);
}

app.get("/api/room-and-accounts", async (req, res) => {
  const rooms = await roomModel.find();
  const accounts = await accountModel.find();

  const options = [
    ...rooms.map((room) => ({
      value: room.roomId,
      text: room.description,
      type: "room",
    })),
    ...accounts.map((acc) => ({
      value: acc.username,
      text: acc.email,
      type: "user",
    })),
  ];
  res.json({
    ok: true,
    options,
  });
});

app.all("*", (req, res) =>
  res.status(404).json({
    ok: false,
    message: `Can't find ${req.originalUrl} on this server`,
  })
);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
