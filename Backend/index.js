require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { scheduleReminders } = require("./services/reminderService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB");
  scheduleReminders();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const userRoutes = require("./routes/user");


app.use("/api/auth", authRoutes); 
app.use("/api/habits", habitRoutes);
app.use("/api/user", userRoutes);


app.get("/", (req, res) => {
  res.send("🌐 Backend is running!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
