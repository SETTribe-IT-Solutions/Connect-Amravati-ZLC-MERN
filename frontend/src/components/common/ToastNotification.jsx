import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastNotification = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ'
  };

  const colors = {
    success: 'border-green-500 bg-green-50',
    error: 'border-red-500 bg-red-50',
    info: 'border-blue-500 bg-blue-50'
  };

  const textColors = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700'
  };

  const iconColors = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    info: 'bg-blue-100'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className={`fixed top-5 right-5 z-[210] border-l-4 ${colors[type]} bg-white shadow-lg rounded-lg overflow-hidden max-w-sm`}
        >
          <div className="flex items-center p-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${iconColors[type]}`}>
              <span className={textColors[type]}>{icons[type]}</span>
            </div>
            <p className={textColors[type]}>{message}</p>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              {/* ✕ */}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;