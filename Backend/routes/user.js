const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Habit = require("../models/Habit");
const authMiddleware = require("../middleware/auth");

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // .select('-password') excludes the password hash
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const habits = await Habit.find({ userId: req.user.id });

    let totalCompletions = 0;
    let allTimeLongestStreak = 0;
    habits.forEach(habit => {
      totalCompletions += habit.completionLog.length;
      if (habit.longestStreak > allTimeLongestStreak) {
        allTimeLongestStreak = habit.longestStreak;
      }
    });

    res.json({
      profile: user,
      stats: {
        totalHabits: habits.filter(h => !h.isArchived).length,
        totalCompletions,
        allTimeLongestStreak,
        badgesEarned: user.badges.length,
      },
    });

  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = username;
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await user.save();
    
    const userData = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      points: updatedUser.points,
      badges: updatedUser.badges,
    };

    res.json({ message: "Profile updated successfully", user: userData });

  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
