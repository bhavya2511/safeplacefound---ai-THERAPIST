import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    mood: {
      type: Number,
      default: 3, // 1–5
    },
  },
  { timestamps: true }
);

export default mongoose.model("Journal", journalSchema);
