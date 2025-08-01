import React from 'react';

const AuroraBackground = ({ type = 'gradient' }) => {
  
  if (type === 'blobs') {
    return (
      <div className="aurora-container">
        <div className="aurora-orb"></div>
        <div className="aurora-orb"></div>
        <div className="aurora-orb"></div>
        <div className="aurora-orb"></div>
      </div>
    );
  }

  return <div className="aurora-gradient-background"></div>;
};

export default AuroraBackground;
