import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GiIndiaGate } from 'react-icons/gi';
import { motion } from 'framer-motion';
import LanguageSelector from '../common/LanguageSelector';

const Header = () => {
  const { t } = useLanguage();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-4xl text-blue-900"
            >
              <GiIndiaGate />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-700 to-green-600 bg-clip-text text-transparent">
                {t('app.title')}
              </h1>
              <p className="text-sm text-gray-600 flex items-center">
                <FaMapMarkerAlt className="mr-1 text-blue-600" />
                {t('app.subtitle')}
              </p>
            </div>
          </div>
          
          <LanguageSelector />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;