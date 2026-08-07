import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

// Serverless functions can cold-start with no live MongoDB connection yet.
// Mongoose's default query buffering waits for a connection that may or may
// not arrive in time, which is why requests were succeeding or hanging
// unpredictably. Instead, cache one connection per warm lambda container
// (globalThis survives across invocations in the same container) and make
// every request explicitly wait for it before touching the database.
mongoose.set("bufferCommands", false);

let cachedConn = globalThis._mongooseConn;
if (!cachedConn) cachedConn = globalThis._mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (cachedConn.conn) return cachedConn.conn;
  if (!cachedConn.promise) {
    cachedConn.promise = mongoose
      .connect(MONGO_URI, { dbName: "ai_therapist", serverSelectionTimeoutMS: 10000 })
      .then(m => {
        console.log("✅ MongoDB connected");
        return m;
      })
      .catch(err => {
        cachedConn.promise = null;
        throw err;
      });
  }
  cachedConn.conn = await cachedConn.promise;
  return cachedConn.conn;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    res.status(503).json({ error: "Database unavailable, please try again" });
  }
});

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

// Quick debug endpoint to check whether the OPENAI_API_KEY is present in the runtime
app.get('/api/_check_openai', (req, res) => {
  try {
    res.json({ hasKey: !!process.env.OPENAI_API_KEY, modelEnv: process.env.OPENAI_MODEL || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

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

// An unhandled rejection inside an async Express route never sends a
// response — the request just hangs until the platform kills it. Wrap every
// async route so failures (e.g. a bad OpenAI key, a dropped Mongo query)
// always produce a real HTTP error instead of a silent hang.
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ───────────────────── Auth Routes ─────────────────────
app.post("/api/register", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  const token = createToken(user);

  res.json({ id: user._id, email, token });
}));

app.post("/api/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = createToken(user);
  res.json({ id: user._id, email, token });
}));

// ───────────────────── Chat Routes ─────────────────────
app.post("/api/chat", authMiddleware, asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const userId = req.user.userId;
  await Message.create({ userId, sender: "user", text: message });

  let reply = '';
  try {
    const ai = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a warm therapist AI." },
        { role: "user", content: message },
      ],
    });

    // support multiple possible response shapes
    reply = ai?.choices?.[0]?.message?.content ?? ai?.choices?.[0]?.text ?? '';
    if (!reply) throw new Error('Empty reply from OpenAI');
  } catch (err) {
    console.error('OpenAI error:', err);
    const errMsg = 'The therapist is temporarily unavailable. Please try again later.';
    try { await Message.create({ userId, sender: "bot", text: errMsg }); } catch (e) { console.error('Failed to save error message:', e); }
    return res.status(502).json({ error: 'OpenAI request failed', details: err?.message ?? String(err) });
  }

  await Message.create({ userId, sender: "bot", text: reply });

  res.json({ reply });
}));

// ✅ New GET route to fetch chat history
app.get("/api/chat", authMiddleware, asyncHandler(async (req, res) => {
  const messages = await Message.find({ userId: req.user.userId }).sort({ createdAt: 1 });
  res.json(messages);
}));

// ───────────────────── Journal Routes ─────────────────────
app.post("/api/journal", authMiddleware, asyncHandler(async (req, res) => {
  const { text, mood } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  const entry = await Journal.create({ userId: req.user.userId, text, mood });
  res.json(entry);
}));

app.get("/api/journal", authMiddleware, asyncHandler(async (req, res) => {
  const entries = await Journal.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(entries);
}));

// ───────────────────── Test / Root Route ─────────────────────
app.get("/api", (req, res) => {
  res.send("✅ API is running. Available routes: /api/register, /api/login, /api/chat, /api/journal");
});

// Catches every asyncHandler rejection above so the client always gets a
// response instead of a hung connection.
app.use((err, req, res, next) => {
  console.error("Request error:", err);
  res.status(502).json({ error: err.message || "Request failed" });
});

// ───────────────────── Server ─────────────────────
// On Vercel the app is invoked as a serverless function (see /api/index.js),
// so only bind a real port when running locally.
if (!process.env.VERCEL) {
  app.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
}

export default app;
