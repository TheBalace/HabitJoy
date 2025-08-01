import React from 'react';

const LevelProgressBar = ({ points }) => {
  const pointsForNextLevel = 100;
  const currentLevel = Math.floor(points / pointsForNextLevel) + 1;
  const pointsInCurrentLevel = points % pointsForNextLevel;
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
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-violet-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LevelProgressBar;