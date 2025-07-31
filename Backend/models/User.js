const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // --- ADDED: username field ---
  // This is needed for personalized greetings (e.g., in reminder emails)
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // --- NEW GAMIFICATION FIELDS ---
  points: {
    type: Number,
    default: 0, // Users start with 0 points
  },
  badges: {
    type: [String], // An array to store unique badge codes
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
