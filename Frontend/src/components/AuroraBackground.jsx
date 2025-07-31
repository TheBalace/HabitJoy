import React from 'react';

/**
 * Renders one of two different background styles based on the 'type' prop.
 * This component now correctly switches between the radiant orbs and the simple gradient.
 */
const AuroraBackground = ({ type = 'gradient' }) => {
  // This is the conditional logic to choose the correct background.
  
  if (type === 'blobs') {
    // For the main app, render the container for the radiant orbs.
    // The CSS class name is "aurora-container".
    return (
      <div className="aurora-container">
        <div className="aurora-orb"></div>
        <div className="aurora-orb"></div>
        <div className="aurora-orb"></div>
        <div className="aurora-orb"></div>
      </div>
    );
  }

  // For the login page, render the simple gradient background.
  // The CSS class name is "aurora-gradient-background".
  return <div className="aurora-gradient-background"></div>;
};

export default AuroraBackground;
