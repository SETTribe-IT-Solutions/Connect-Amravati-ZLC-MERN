import React from 'react';
import { motion } from 'framer-motion';
import { GiIndiaGate } from 'react-icons/gi';
import { useLanguage } from "../../context/LanguageContext";

const CulturalSection = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden min-h-[400px]"
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 opacity-10">
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
            className="absolute border-4 border-white rounded-full"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              top: `${20 + i * 10}%`,
              left: `${20 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-white text-center">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="mb-8"
        >
          <GiIndiaGate className="text-8xl mx-auto" />
        </motion.div>

        <motion.h2
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl font-bold mb-6"
        >
          {t('app.title')}
        </motion.h2>

        <div className="h-1 w-24 bg-gradient-to-r from-orange-400 via-white to-green-400 mx-auto mb-6" />

        <p className="text-xl text-blue-100 mb-4">
          {t('cultural.admin_title')}
        </p>

        <div className="flex justify-center space-x-4 mt-8">
          {['a', 'ma', 'ra'].map((item, index) => (
            <motion.div
              key={item}
              whileHover={{ scale: 1.2, rotate: 360 }}
              className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${index === 0 ? 'bg-orange-500' : index === 1 ? 'bg-white' : 'bg-green-500'
                }`}
            >
              <span className={`font-bold text-xl ${index === 1 ? 'text-blue-900' : 'text-white'
                }`}>
                {t(`cultural.${item}`)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CulturalSection;
