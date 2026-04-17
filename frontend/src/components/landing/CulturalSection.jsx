import React from 'react';
import { motion } from 'framer-motion';
import { Col } from 'react-bootstrap';
import amravatiLandmark from '../../assets/images/amravati_landmark.png';

const CulturalSection = () => {
  return (
    <Col lg={6} className="p-0 position-relative overflow-hidden d-none d-lg-block">
      {/* Background Image with Gradient Overlay */}
      <div 
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
          background: 'linear-gradient(to right, rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.4), transparent)'
        }}
      />

      <div className="position-relative z-index-10 h-100 d-flex flex-column justify-content-center p-5 text-white">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ duration: 1, delay: 1 }}
              className="bg-primary mb-3" 
              style={{ height: '4px' }} 
            />
            <h2 className="display-3 fw-bold mb-2 font-outfit tracking-tight">
              DISTRICT <br /> 
              <span className="text-info">CONNECT</span>
            </h2>
          </div>

          <div className="d-flex align-items-center gap-4 mt-auto">
            <div className="d-flex flex-column">
              <div className="d-flex gap-2">
                {['A', 'MA', 'RA'].map((item, index) => (
                  <motion.div
                    key={item}
                    whileHover={{ y: -5, scale: 1.1 }}
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ 
                      width: '45px', 
                      height: '45px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontSize: '0.9rem',
                      fontWeight: '700'
                    }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
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
