const User = require('../models/User');

const allBadges = {
  POINTS_100: { name: "Point Collector", description: "Earn your first 100 points." },
  POINTS_500: { name: "Point Enthusiast", description: "Earn 500 points." },
  POINTS_1000: { name: "Point Master", description: "Earn 1,000 points." },

  STREAK_3: { name: "On a Roll!", description: "Maintain a 3-day streak on any habit." },
  STREAK_7: { name: "Weekly Warrior", description: "Maintain a 7-day streak on any habit." },
  STREAK_30: { name: "Month of Mastery", description: "Maintain a 30-day streak on any habit." },
};

const checkAndAwardBadges = async (userId, completedHabit) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const newBadges = [];

    const awardBadge = (badgeId) => {
      if (!user.badges.includes(badgeId)) {
        user.badges.push(badgeId);
        newBadges.push(badgeId);
        console.log(`Awarding badge [${badgeId}] to user ${user.username}`);
      }
    };

    if (user.points >= 100) awardBadge('POINTS_100');
    if (user.points >= 500) awardBadge('POINTS_500');
    if (user.points >= 1000) awardBadge('POINTS_1000');

    if (completedHabit.currentStreak >= 3) awardBadge('STREAK_3');
    if (completedHabit.currentStreak >= 7) awardBadge('STREAK_7');
    if (completedHabit.currentStreak >= 30) awardBadge('STREAK_30');

    if (newBadges.length > 0) {
      await user.save();
    }

  } catch (error) {
    console.error("Error in checkAndAwardBadges:", error);
  }
};

module.exports = { checkAndAwardBadges, allBadges };
