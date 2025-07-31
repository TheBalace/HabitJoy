// src/components/LevelProgressBar.jsx

import React from 'react';

const LevelProgressBar = ({ points }) => {
  // --- Gamification Logic ---
  // Each level requires 100 points.
  const pointsForNextLevel = 100;
  // Calculate the user's current level. Level 1 is from 0-99 points.
  const currentLevel = Math.floor(points / pointsForNextLevel) + 1;
  // Calculate how many points the user has earned within the current level.
  const pointsInCurrentLevel = points % pointsForNextLevel;
  // Calculate the progress percentage for the bar.
  const progressPercentage = (pointsInCurrentLevel / pointsForNextLevel) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-bold text-[var(--text-color)] drop-shadow">
          Level {currentLevel}
        </span>
        <span className="text-[var(--text-color-muted)]">
          {pointsInCurrentLevel} / {pointsForNextLevel} XP
        </span>
      </div>
      {/* The container for the progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
        {/* The filled part of the bar with a gradient and animation */}
        <div 
          className="bg-gradient-to-r from-violet-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LevelProgressBar;