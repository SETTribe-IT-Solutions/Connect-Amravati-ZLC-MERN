import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSettings = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-xl">
            <GlobeAltIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('language.select')}</h1>
            <p className="text-gray-600 mt-1">Choose your preferred language for the interface</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => changeLanguage(lang.code)}
              className={`p-6 rounded-xl border-2 transition-all ${
                i18n.language === lang.code
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-4xl mb-3">{lang.flag}</div>
              <h3 className="text-lg font-semibold text-gray-900">{lang.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{lang.nativeName}</p>
              {i18n.language === lang.code && (
                <div className="flex items-center justify-center gap-1 text-blue-600">
                  <CheckIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> The interface will automatically switch to your selected language. 
            You can change it anytime from this page or the language selector in the header.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LanguageSettings;