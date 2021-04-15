import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
  chatName: String,
  conversation: [
    {
      message: String,
      timestamp: String,
      user: {
        displayName: String,
        email: String,
        photo: String,
        uid: String,
      },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
