import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GiIndiaGate } from 'react-icons/gi';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Header = ({ setSidebarOpen }) => {
  const { t } = useTranslation();

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
            {setSidebarOpen && (
              <button
                type="button"
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-4xl text-blue-900"
            >
              <GiIndiaGate />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-700 to-green-600 bg-clip-text text-transparent">
                {t('DISTRICT CONNECT') || 'Amravati Connect'}
              </h1>
              <p className="text-sm text-gray-600 flex items-center">
                <FaMapMarkerAlt className="mr-1 text-blue-600" />
                {t('app.subtitle') || 'Collector Office, Amravati'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
