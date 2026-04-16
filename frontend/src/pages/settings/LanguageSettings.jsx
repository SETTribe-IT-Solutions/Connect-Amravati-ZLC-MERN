import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { changeGoogleLanguage, getCurrentLanguage } from '../utils/translate';

const LanguageSettings = () => {
  const [currentLang, setCurrentLang] = useState(() => getCurrentLanguage() || 'en');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  ];

  const changeLanguage = (langCode) => {
    changeGoogleLanguage(langCode);
    setCurrentLang(langCode);
  };

  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
        <Card.Body className="p-4 p-md-5">
          <div className="d-flex align-items-center gap-4 mb-5">
            <div className="p-3 bg-primary bg-opacity-10 rounded-4">
              <GlobeAltIcon style={{ width: '2.5rem' }} className="text-primary" />
            </div>
            <div>
              <h1 className="display-6 fw-bold text-dark mb-1 font-outfit">Select Language</h1>
              <p className="text-secondary mb-0">Choose your preferred language for the interface</p>
            </div>
          </div>

          <Row className="g-4">
            {languages.map((lang) => (
              <Col key={lang.code} md={4}>
                <Card 
                  className={`h-100 border-2 transition-all cursor-pointer text-center p-4 rounded-4 ${
                    currentLang === lang.code 
                      ? 'border-primary bg-primary bg-opacity-5 shadow' 
                      : 'border-light hover-border-primary'
                  }`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <div className="display-4 mb-3">{lang.flag}</div>
                  <h5 className="fw-bold text-dark mb-1">{lang.name}</h5>
                  <p className="small text-secondary mb-3">{lang.nativeName}</p>
                  
                  {currentLang === lang.code ? (
                    <Badge pill bg="primary" className="py-2 px-3 fw-bold d-flex align-items-center justify-content-center gap-2 mx-auto" style={{ width: 'fit-content' }}>
                      <CheckIcon style={{ width: '1rem' }} /> Selected
                    </Badge>
                  ) : (
                    <div style={{ height: '31px' }}></div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="bg-light border-0 rounded-4 mt-5">
            <Card.Body className="p-4">
              <p className="small text-secondary mb-0">
                <span className="fw-bold text-dark">Note:</span> The interface will automatically switch to your selected language using Google Translate. 
                You can change it anytime from this page or the language selector in the header.
              </p>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LanguageSettings;