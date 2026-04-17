import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeOverlay = ({ onComplete }) => {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      if (onComplete) onComplete();
    }, 2800);
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
            background: '#0f172a',
          }}
        >
          <div className="text-center text-white px-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="mb-0 font-outfit tracking-widest text-uppercase small opacity-60">District Administration</h2>
              <h1 className="display-2 fw-bold mb-4 font-outfit tracking-tighter">
                CONNECT <span className="text-primary">AMRAVATI</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100px' }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              className="bg-primary mx-auto mb-4"
              style={{ height: '3px' }}
            />

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="h5 fw-light font-outfit text-info"
            >
              Secure Communication Portal
            </motion.p>
          </div>
          
          {/* Subtle Corner Accents */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
