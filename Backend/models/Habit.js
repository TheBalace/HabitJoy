const mongoose = require("mongoose");

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
}, { _id: false }); 


const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  frequency: { type: String, enum: ["daily", "weekly", "monthly", "custom"], default: "daily" },
  customDays: { type: [String], default: [] },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date, default: null },
  
  completionLog: {
    type: [entrySchema],
    default: [],
  },
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
