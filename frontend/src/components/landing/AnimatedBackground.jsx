import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1 }}>
      {/* Mesh Gradient Background */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 100% 0%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(29, 78, 216, 0.08) 0%, transparent 50%)
          `,
          backgroundColor: '#f8fafc'
        }}
      />

      {/* Floating Subtle Circles */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="position-absolute rounded-circle"
        style={{
          width: '600px',
          height: '600px',
          background: 'rgba(59, 130, 246, 0.03)',
          filter: 'blur(80px)',
          top: '-10%',
          left: '-10%',
        }}
      />

      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="position-absolute rounded-circle"
        style={{
          width: '800px',
          height: '800px',
          background: 'rgba(249, 115, 22, 0.03)',
          filter: 'blur(100px)',
          bottom: '-20%',
          right: '-10%',
        }}
      />

      {/* Tricolor Border Indicator at the very top */}
      <div className="gradient-border" style={{ position: 'fixed', top: 0, height: '3px' }}></div>
    </div>
  );
};

export default AnimatedBackground;
