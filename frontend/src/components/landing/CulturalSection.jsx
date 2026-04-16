import React from 'react';
import { motion } from 'framer-motion';
import { GiIndiaGate } from 'react-icons/gi';
import { Col } from 'react-bootstrap';

const CulturalSection = () => {
  return (
    <Col lg={6} className="p-0 d-flex align-items-center justify-content-center position-relative overflow-hidden min-vh-50 vh-lg-100" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8, #1e3a8a)' }}>
      {/* Animated Background Circles */}
      <div className="position-absolute inset-0 opacity-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="position-absolute border border-4 border-white rounded-circle"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              top: `${20 + i * 10}%`,
              left: `${20 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="position-relative z-index-10 text-white text-center p-5">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="mb-4"
        >
          <GiIndiaGate size={120} className="mx-auto" />
        </motion.div>

        <motion.h2
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="display-4 fw-bold mb-4 font-outfit"
        >
          CONNECT AMRAVATI
        </motion.h2>

        <div className="mx-auto mb-4" style={{ height: '4px', width: '100px', background: 'linear-gradient(to right, #f97316, #ffffff, #22c55e)' }} />

        <p className="h5 text-light mb-5 fw-light opacity-75">
          District Administration Communication Portal
        </p>

        <div className="d-flex justify-content-center gap-3">
          {['A', 'MA', 'RA'].map((item, index) => (
            <motion.div
              key={item}
              whileHover={{ scale: 1.2, rotate: 360 }}
              className={`rounded-circle d-flex align-items-center justify-content-center shadow cursor-pointer`}
              style={{ 
                width: '60px', 
                height: '60px',
                backgroundColor: index === 0 ? '#f97316' : index === 1 ? '#ffffff' : '#22c55e',
                color: index === 1 ? '#1e3a8a' : '#ffffff'
              }}
            >
              <span className="fw-bold h4 mb-0">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Col>
  );
};

export default CulturalSection;
