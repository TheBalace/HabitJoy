const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const { checkAndAwardBadges } = require("../services/gamificationService");
const { scheduleReminders } = require("../services/reminderService"); // Assuming reminder service is correctly named

const getUserDateString = (utcDate, offsetMinutes) => {
    const localTime = new Date(utcDate.getTime() - (offsetMinutes * 60000));
    return localTime.toISOString().split('T')[0];
};

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    if (habits.length === 0) {
        return res.json([]);
    }
    const userTimezoneOffset = habits[0].timezoneOffset ?? new Date().getTimezoneOffset();
    const stats = new Map();
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const userDateString = getUserDateString(date, userTimezoneOffset);
        const localDate = new Date(date.getTime() - (userTimezoneOffset * 60000));
        const dayName = dayLabels[localDate.getUTCDay()];
        const uniqueDayLabel = `${dayName} (${localDate.getUTCMonth() + 1}/${localDate.getUTCDate()})`;
        if (!stats.has(userDateString)) {
            stats.set(userDateString, { name: uniqueDayLabel, completions: 0 });
        }
    }
    habits.forEach(habit => {
        const offset = habit.timezoneOffset ?? userTimezoneOffset;
        habit.completionLog.forEach(entry => {
            const entryUserDateString = getUserDateString(entry.date, offset);
            if (stats.has(entryUserDateString)) {
                stats.get(entryUserDateString).completions += 1;
            }
        });
    });
    res.json(Array.from(stats.values()));
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/complete", authMiddleware, async (req, res) => {
    try {
        const { note } = req.body;
        const habit = await Habit.findById(req.params.id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        const offset = habit.timezoneOffset ?? new Date().getTimezoneOffset();
        const completionTimestamp = new Date();
        const todayUserString = getUserDateString(completionTimestamp, offset);
        if (habit.completionLog.some(entry => getUserDateString(entry.date, offset) === todayUserString)) {
            return res.status(400).json({ message: "Habit already completed today." });
        }
        const lastEntry = habit.completionLog.length > 0 ? habit.completionLog[habit.completionLog.length - 1] : null;
        if (lastEntry) {
            const yesterdayTimestamp = new Date();
            yesterdayTimestamp.setDate(yesterdayTimestamp.getDate() - 1);
            const yesterdayUserString = getUserDateString(yesterdayTimestamp, offset);
            const lastEntryUserString = getUserDateString(lastEntry.date, offset);
            if (lastEntryUserString === yesterdayUserString) {
                habit.currentStreak += 1;
            } else if (lastEntryUserString !== todayUserString) {
                habit.currentStreak = 1;
            }
        } else {
            habit.currentStreak = 1;
        }
        if (habit.currentStreak > habit.longestStreak) {
            habit.longestStreak = habit.currentStreak;
        }
        habit.completionLog.push({ date: completionTimestamp, note: note || '' });
        await habit.save();
        const user = await User.findById(req.user.id);
        if (user) {
            user.points += 10;
            await user.save();
            await checkAndAwardBadges(user._id, habit);
            const updatedUser = await User.findById(req.user.id);
            const userData = { id: updatedUser._id, username: updatedUser.username, email: updatedUser.email, points: updatedUser.points, badges: updatedUser.badges };
            res.json({ message: "Habit marked as completed", habit, user: userData });
        } else {
            res.json({ message: "Habit marked as completed", habit });
        }
    } catch (err) {
        console.error("Completion error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/:id/undo", authMiddleware, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        const offset = habit.timezoneOffset ?? new Date().getTimezoneOffset();
        const todayUserString = getUserDateString(new Date(), offset);
        const initialLength = habit.completionLog.length;

        habit.completionLog = habit.completionLog.filter(entry => getUserDateString(entry.date, offset) !== todayUserString);

        if (habit.completionLog.length === initialLength) {
            return res.status(400).json({ message: "Habit was not completed today." });
        }

        const wasAtMaxStreak = habit.currentStreak === habit.longestStreak;

        habit.currentStreak = Math.max(0, habit.currentStreak - 1);

        if (wasAtMaxStreak) {
            habit.longestStreak = habit.currentStreak;
        }

        const user = await User.findById(req.user.id);
        if (user) {
            user.points = Math.max(0, user.points - 10);
            await user.save();
            await habit.save();
            const userData = { id: user._id, username: user.username, email: user.email, points: user.points, badges: user.badges };
            res.json({ message: "Habit completion undone", habit, user: userData });
        } else {
            await habit.save();
            res.json({ message: "Habit completion undone", habit });
        }
    } catch (err) {
        console.error("Undo error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/", authMiddleware, async (req, res) => { 
  try { 
    const habits = await Habit.find({ userId: req.user.id, isArchived: { $ne: true } }).sort({ createdAt: -1 }); 
    res.json(habits); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: "Server error" }); 
  } 
});

router.get("/all", authMiddleware, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error("Error fetching all habits:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/archived", authMiddleware, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id, isArchived: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error("Error fetching archived habits:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => { try { const { title, description, frequency, customDays = [], reminderEnabled, reminderTime, timezoneOffset, area, isNegative } = req.body; const newHabit = new Habit({ userId: req.user.id, title, description, frequency, customDays, reminderEnabled, reminderTime, timezoneOffset, area, isNegative, }); const savedHabit = await newHabit.save(); res.status(201).json(savedHabit); } catch (err) { console.error("Error creating habit:", err); res.status(500).json({ message: "Server error" }); } });

router.put("/:id", authMiddleware, async (req, res) => { try { const habit = await Habit.findById(req.params.id); if (!habit || habit.userId.toString() !== req.user.id) { return res.status(404).json({ message: "Habit not found" }); } const { title, description, frequency, customDays = [], reminderEnabled, reminderTime, timezoneOffset, area, isNegative } = req.body; habit.title = title ?? habit.title; habit.description = description ?? habit.description; habit.frequency = frequency ?? habit.frequency; habit.customDays = frequency === "custom" ? customDays : []; habit.reminderEnabled = reminderEnabled ?? habit.reminderEnabled; habit.reminderTime = reminderTime; habit.timezoneOffset = timezoneOffset ?? habit.timezoneOffset; habit.area = area ?? habit.area; habit.isNegative = isNegative ?? habit.isNegative; const updatedHabit = await habit.save(); res.json(updatedHabit); } catch (err) { console.error("Error updating habit:", err); res.status(500).json({ message: "Server error" }); } });

router.delete("/:id", authMiddleware, async (req, res) => { try { const habit = await Habit.findById(req.params.id); if (!habit) { return res.status(404).json({ message: "Habit not found" }); } if (habit.userId.toString() !== req.user.id) { return res.status(401).json({ message: "Not authorized" }); } await habit.deleteOne(); res.json({ message: "Habit deleted successfully" }); } catch (err) { console.error("Error deleting habit:", err); res.status(500).json({ message: "Server error" }); } });

router.put("/:id/archive", authMiddleware, async (req, res) => { try { const habit = await Habit.findById(req.params.id); if (!habit || habit.userId.toString() !== req.user.id) { return res.status(404).json({ message: "Habit not found" }); } habit.isArchived = !habit.isArchived; const savedHabit = await habit.save(); res.json({ habit: savedHabit }); } catch (err) { console.error("Archive toggle error:", err); res.status(500).json({ message: "Server error" }); } });

router.post("/:id/fail", authMiddleware, async (req, res) => { try { const { note } = req.body; const habit = await Habit.findById(req.params.id); if (!habit) { return res.status(404).json({ message: "Habit not found" }); } if (!habit.isNegative) { return res.status(400).json({ message: "This action is only for negative habits." }); } habit.failureLog.push({ date: new Date(), note: note || '' }); habit.currentStreak = 0; await habit.save(); res.json({ message: "Habit setback logged", habit }); } catch (err) { console.error("Failure log error:", err); res.status(500).json({ message: "Server error" }); } });

router.post("/:id/reset", authMiddleware, async (req, res) => { try { const habit = await Habit.findById(req.params.id); if (!habit) { return res.status(404).json({ message: "Habit not found" }); } habit.currentStreak = 0; habit.longestStreak = 0; habit.completionLog = []; habit.failureLog = []; await habit.save(); res.json({ message: "Habit reset.", habit }); } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); } });

module.exports = router;
