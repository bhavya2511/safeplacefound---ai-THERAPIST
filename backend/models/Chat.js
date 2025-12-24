import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
