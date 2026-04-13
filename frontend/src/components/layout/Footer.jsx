import React from 'react';

import { GiPeaceDove } from 'react-icons/gi';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 50 }}
      className="bg-white/90 backdrop-blur-md border-t border-gray-200 mt-8 rounded-b-3xl"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          <p className="text-gray-600 text-sm flex items-center flex-wrap">
            <GiPeaceDove className="mr-2 text-blue-600" />
            <span className="mr-6">
              &copy; {new Date().getFullYear()} District Connect Amravati | Managed and Maintained by{' '}
              <a href="https://settribe.com/" className="font-bold text-blue-600 hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer">
                SETTribe
              </a>.
            </span>
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
