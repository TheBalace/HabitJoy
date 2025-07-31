require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// --- FIXED: Use the correct function name from the service ---
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
  // --- FIXED: Call the correct function name ---
  scheduleReminders();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Import existing routes
const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const userRoutes = require("./routes/user");


// Use existing routes
app.use("/api/auth", authRoutes); 
app.use("/api/habits", habitRoutes);
app.use("/api/user", userRoutes);


app.get("/", (req, res) => {
  res.send("🌐 Backend is running!");
});

// --- THIS IS THE ONLY CHANGE ---
// Added "0.0.0.0" to make the server accessible in a cloud environment
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
