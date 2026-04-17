import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeOverlay = ({ onComplete }) => {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      if (onComplete) onComplete();
    }, 3000); // Increased time as requested for a better cinematic feel
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 9999,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Subtle gradient for depth
          }}
        >
          <div className="text-center px-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="display-1 fw-bold mb-4 font-outfit tracking-tighter text-white" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                DISTRICT <span className="text-primary" style={{ color: '#3b82f6' }}>CONNECT</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
              className="bg-primary mx-auto mb-4"
              style={{ height: '3px', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="h5 fw-light font-outfit text-white-50"
              style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}
            >
              Official Communication Portal
            </motion.p>
          </div>

          {/* Subtle Corner Accents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="position-absolute top-0 end-0 p-5 d-none d-md-block"
          >
            <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.2)', position: 'absolute', top: '48px', right: '48px' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
