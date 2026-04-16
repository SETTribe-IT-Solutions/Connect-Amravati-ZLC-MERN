import React from 'react';

const AnimatedBackground = () => {
  return (
    <>
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -10 }}>
        <div className="position-absolute rounded-circle" style={{ 
          top: '-160px', 
          right: '-160px', 
          width: '320px', 
          height: '320px', 
          backgroundColor: '#bfdbfe', 
          mixBlendMode: 'multiply', 
          filter: 'blur(64px)', 
          opacity: 0.2,
          animation: 'pulse 3s infinite'
        }}></div>
        <div className="position-absolute rounded-circle" style={{ 
          bottom: '-160px', 
          left: '-160px', 
          width: '320px', 
          height: '320px', 
          backgroundColor: '#ffedd5', 
          mixBlendMode: 'multiply', 
          filter: 'blur(64px)', 
          opacity: 0.2,
          animation: 'pulse 3s infinite 2s'
        }}></div>
        <div className="position-absolute rounded-circle start-50 top-50 translate-middle" style={{ 
          width: '384px', 
          height: '384px', 
          backgroundColor: '#dcfce7', 
          mixBlendMode: 'multiply', 
          filter: 'blur(64px)', 
          opacity: 0.2,
          animation: 'pulse 3s infinite 4s'
        }}></div>
      </div>
      {/* Gradient Border */}
      <div className="gradient-border"></div>
    </>
  );
};

export default AnimatedBackground;
