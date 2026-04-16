import React, { useState, useEffect } from 'react';
import { FaLanguage } from 'react-icons/fa';
import { Dropdown } from 'react-bootstrap';
import { changeGoogleLanguage, getCurrentLanguage } from '../../utils/translate';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage() || 'en');
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' }
  ];

  const changeLanguage = (code) => {
    changeGoogleLanguage(code);
    setCurrentLanguage(code);
  };

  const currentLangObj = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="light" 
        className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm border-0 bg-opacity-75"
        style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ea580c', backgroundColor: '#fff7ed' }}
      >
        <FaLanguage size={18} />
        <span className="d-none d-md-inline">{currentLangObj.name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="border-0 shadow-lg rounded-3 mt-2 overflow-hidden">
        {languages.map((lang) => (
          <Dropdown.Item 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            active={currentLanguage === lang.code}
            className="d-flex align-items-center gap-3 px-4 py-3 fw-medium"
          >
            <span style={{ fontSize: '1.25rem' }}>{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLanguage === lang.code && (
              <span className="ms-auto text-primary">✓</span>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;