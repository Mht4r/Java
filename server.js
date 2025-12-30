// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config(); // 👈 VERY IMPORTANT (top line)


const app = express();

// ---------- Middlewares ----------
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------- MongoDB ----------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error("MONGO_URI not defined");
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
        console.error("Mongo Error:", err);
        throw err;
    });

// ---------- Schema ----------
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    userid: String,
    timetable: Array,
    attendance: Object,
    dailyActions: Object,
    biometric: { type: Number, default: 0 },
    examDate: String,
});

const User =
    mongoose.models.User || mongoose.model("User", UserSchema);

// ---------- Routes ----------
app.get("/", (req, res) => {
    res.send("Class-CA API Running");
});

app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ success: true, user });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.post("/login", async (req, res) => {
    const { userid, password } = req.body;
    const user = await User.findOne({ userid, password });
    if (user) res.json({ success: true, user });
    else res.status(400).json({ success: false });
});

app.post("/sync", async (req, res) => {
    const { email, data } = req.body;
    await User.findOneAndUpdate({ email }, data);
    res.json({ success: true });
});

// ❌ NO app.listen()
// ✅ Vercel needs only export
module.exports = app;
