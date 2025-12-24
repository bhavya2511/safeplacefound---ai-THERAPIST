import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("❌ Missing env variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { dbName: "ai_therapist" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// ───────────────────── Models ─────────────────────
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  mood: { type: Number, default: 3 },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);
const Journal = mongoose.model("Journal", journalSchema);

// ───────────────────── OpenAI ─────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ───────────────────── Auth ─────────────────────
function createToken(user) {
  return jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ───────────────────── Auth Routes ─────────────────────
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  const token = createToken(user);

  res.json({ id: user._id, email, token });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = createToken(user);
  res.json({ id: user._id, email, token });
});

// ───────────────────── Chat Routes ─────────────────────
app.post("/api/chat", authMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const userId = req.user.userId;
  await Message.create({ userId, sender: "user", text: message });

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a warm therapist AI." },
      { role: "user", content: message },
    ],
  });

  const reply = ai.choices[0].message.content;
  await Message.create({ userId, sender: "bot", text: reply });

  res.json({ reply });
});

// ✅ New GET route to fetch chat history
app.get("/api/chat", authMiddleware, async (req, res) => {
  const messages = await Message.find({ userId: req.user.userId }).sort({ createdAt: 1 });
  res.json(messages);
});

// ───────────────────── Journal Routes ─────────────────────
app.post("/api/journal", authMiddleware, async (req, res) => {
  const { text, mood } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  const entry = await Journal.create({ userId: req.user.userId, text, mood });
  res.json(entry);
});

app.get("/api/journal", authMiddleware, async (req, res) => {
  const entries = await Journal.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(entries);
});

// ───────────────────── Test / Root Route ─────────────────────
app.get("/api", (req, res) => {
  res.send("✅ API is running. Available routes: /api/register, /api/login, /api/chat, /api/journal");
});

// ───────────────────── Server ─────────────────────
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
