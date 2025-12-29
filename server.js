// Is file ko run karne ke liye: node server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// REPLACE WITH YOUR MONGODB URL
const MONGO_URI = "mongodb+srv://admin:MohitClassCa0123456789@classca.e1gprqt.mongodb.net/classca?appName=ClassCa";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    userid: String,
    timetable: Array, // [{day: 'Mon', subject: 'Math', time: '10:00'}]
    attendance: Object, // { "recordId": ["present", "absent"] }
    dailyActions: Object,
    biometric: { type: Number, default: 0 },
    examDate: String
});

const User = mongoose.model('User', UserSchema);

// Routes
app.post('/register', async (req, res) => {
    const { name, email, userid, password } = req.body;
    try {
        const newUser = new User({ name, email, userid, password, timetable: [], attendance: {}, dailyActions: {}, biometric: 0 });
        await newUser.save();
        res.json({ success: true, user: newUser });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post('/login', async (req, res) => {
    const { userid, password } = req.body;
    const user = await User.findOne({ userid, password });
    if (user) res.json({ success: true, user });
    else res.status(400).json({ success: false, message: "Invalid credentials" });
});

app.post('/sync', async (req, res) => {
    const { email, data } = req.body; // data contains timetable, attendance, etc.
    await User.findOneAndUpdate({ email }, data);
    res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));