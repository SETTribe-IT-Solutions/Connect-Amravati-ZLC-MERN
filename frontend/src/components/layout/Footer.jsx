import React from 'react';

import { GiPeaceDove } from 'react-icons/gi';
import { motion } from 'framer-motion';

const Footer = React.memo(() => {
  return (
    
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border-top mt-auto py-3"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
    >
      <div className="container">
        <div className="d-flex align-items-center justify-content-center">
          <p className="text-secondary small mb-0 text-center">
            &copy; {new Date().getFullYear()} District Connect Amravati | Designed and Maintained by{' '}
            <a
              href="https://settribe.com/"
              className="fw-bold text-primary text-decoration-none"
              target="_blank"
              rel="noopener noreferrer"
            >
              SETTribe
            </a>.
          </p>
        </div>
      </div>
    </motion.footer>
  );
});

export default Footer;
