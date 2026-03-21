import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLanguage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('language.english'), flag: '🇬🇧' },
    { code: 'mr', name: t('language.marathi'), flag: '🇮🇳' },
    { code: 'hi', name: t('language.hindi'), flag: '🇮🇳' }
  ];

  const currentLanguage = i18n.language || 'en';

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full hover:bg-orange-200 transition-colors shadow-sm"
      >
        <FaLanguage className="text-orange-600" />
        <span className="text-sm font-medium text-orange-700">
          {languages.find(l => l.code === currentLanguage.split('-')[0])?.name || 'English'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 ${
                  currentLanguage.split('-')[0] === lang.code ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {currentLanguage.split('-')[0] === lang.code && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-blue-600"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;