const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Habit = require("../models/Habit"); // We need this to calculate stats
const authMiddleware = require("../middleware/auth");

// --- NEW: GET /api/user/profile ---
// Fetches detailed stats and profile information for the logged-in user.
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // 1. Find the user
    const user = await User.findById(req.user.id).select("-password"); // .select('-password') excludes the password hash
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Find all of the user's habits to calculate stats
    const habits = await Habit.find({ userId: req.user.id });

    // 3. Calculate All-Time Stats
    let totalCompletions = 0;
    let allTimeLongestStreak = 0;
    habits.forEach(habit => {
      totalCompletions += habit.completionLog.length;
      if (habit.longestStreak > allTimeLongestStreak) {
        allTimeLongestStreak = habit.longestStreak;
      }
    });

    // 4. Send back a combined object of profile data and calculated stats
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


// --- NEW: PUT /api/user/profile ---
// Updates the user's username and/or password.
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (username && username !== user.username) {
      // Check if the new username is already taken
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = username;
    }

    // Update password if provided
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await user.save();
    
    // Send back the updated user data (without the password)
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
