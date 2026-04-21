import React from 'react';
import { motion } from 'framer-motion';
import { Col } from 'react-bootstrap';
import amravatiLandmark from '../../assets/images/amravati_landmark.png';

const CulturalSection = () => {
  return (
    <Col lg={6} className="p-0 position-relative overflow-hidden d-none d-lg-block">
      {/* Background Image with Gradient Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="position-absolute inset-0 w-100 h-100"
        style={{
          backgroundImage: `url(${amravatiLandmark})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7) contrast(1.1)'
        }}
      />
      
      {/* Gradient Overlay for Text Readability */}
      <div 
        className="position-absolute inset-0 w-100 h-100"
        style={{
          background: 'linear-gradient(to right, rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.4), transparent)',
          zIndex: 1
        }}
      />

      <div 
        className="position-relative h-100 d-flex flex-column justify-content-center p-5 text-white"
        style={{ zIndex: 10 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="mb-4">
            <h2 className="display-3 fw-bold mb-2 font-outfit tracking-tight text-white shadow-sm" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              DISTRICT <br /> 
              <span className="text-info" style={{ color: '#60a5fa !important' }}>CONNECT</span>
            </h2>
          </div>

        </motion.div>

        {/* Subtle Watermark Branding */}
        <div className="position-absolute bottom-0 start-0 p-5 opacity-40">
          <p className="small mb-0 font-outfit tracking-widest text-uppercase">
            District Administration <br /> Amravati, Maharashtra
          </p>
        </div>
      </div>
    </Col>
  );
};

export default CulturalSection;
