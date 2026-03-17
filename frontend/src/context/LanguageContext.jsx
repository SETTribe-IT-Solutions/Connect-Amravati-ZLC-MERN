import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

import en from '../assets/translations/en.json';
import mr from '../assets/translations/mr.json';
import hi from '../assets/translations/hi.json';

const translations = {
  en,
  mr,
  hi
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
