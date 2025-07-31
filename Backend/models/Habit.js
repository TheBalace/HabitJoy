const mongoose = require("mongoose");

// --- 1. NEW: Define a sub-schema for journal entries ---
// This creates a blueprint for our log entries, ensuring each one
// has a date and an optional note.
const entrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
    trim: true,
    default: '',
  }
}, { _id: false }); // We set _id to false as these are sub-documents within a habit.


const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  frequency: { type: String, enum: ["daily", "weekly", "monthly", "custom"], default: "daily" },
  customDays: { type: [String], default: [] },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date, default: null },
  
  // --- 2. REPLACED: Old date arrays are now rich logs ---
  // completedDates is now completionLog
  completionLog: {
    type: [entrySchema],
    default: [],
  },
  // failureDates is now failureLog
  failureLog: {
    type: [entrySchema],
    default: [],
  },

  reminderEnabled: { type: Boolean, default: false },
  reminderTime: { type: String, default: null },
  timezoneOffset: { type: Number, default: null },
  area: {
    type: String,
    trim: true,
    default: 'General',
  },
  isNegative: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

const Habit = mongoose.model("Habit", habitSchema);
module.exports = Habit;
