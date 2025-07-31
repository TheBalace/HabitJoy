const User = require('../models/User');

// --- 1. DEFINE ALL AVAILABLE BADGES ---
// We define our badges in a central place. This makes it easy to add more later.
const allBadges = {
  // Point-based badges
  POINTS_100: { name: "Point Collector", description: "Earn your first 100 points." },
  POINTS_500: { name: "Point Enthusiast", description: "Earn 500 points." },
  POINTS_1000: { name: "Point Master", description: "Earn 1,000 points." },

  // Streak-based badges (related to a specific habit)
  STREAK_3: { name: "On a Roll!", description: "Maintain a 3-day streak on any habit." },
  STREAK_7: { name: "Weekly Warrior", description: "Maintain a 7-day streak on any habit." },
  STREAK_30: { name: "Month of Mastery", description: "Maintain a 30-day streak on any habit." },
};

// --- 2. THE CORE LOGIC FUNCTION ---
const checkAndAwardBadges = async (userId, completedHabit) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const newBadges = []; // To keep track of newly awarded badges

    // Helper function to check for and add a new badge
    const awardBadge = (badgeId) => {
      // Check if the user DOES NOT already have this badge
      if (!user.badges.includes(badgeId)) {
        user.badges.push(badgeId);
        newBadges.push(badgeId);
        console.log(`Awarding badge [${badgeId}] to user ${user.username}`);
      }
    };

    // --- 3. CHECK CONDITIONS FOR EACH BADGE ---

    // Check point-based badges
    if (user.points >= 100) awardBadge('POINTS_100');
    if (user.points >= 500) awardBadge('POINTS_500');
    if (user.points >= 1000) awardBadge('POINTS_1000');

    // Check streak-based badges (using the habit that was just completed)
    if (completedHabit.currentStreak >= 3) awardBadge('STREAK_3');
    if (completedHabit.currentStreak >= 7) awardBadge('STREAK_7');
    if (completedHabit.currentStreak >= 30) awardBadge('STREAK_30');

    // If any new badges were awarded, save the user
    if (newBadges.length > 0) {
      await user.save();
    }

  } catch (error) {
    console.error("Error in checkAndAwardBadges:", error);
  }
};

// Export the function so it can be used in other files
module.exports = { checkAndAwardBadges, allBadges };
