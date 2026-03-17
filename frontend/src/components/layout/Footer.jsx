import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GiPeaceDove } from 'react-icons/gi';
import { motion } from 'framer-motion';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 50 }}
      className="bg-white/90 backdrop-blur-md border-t border-gray-200 mt-8 rounded-b-3xl"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm flex items-center">
            <GiPeaceDove className="mr-2 text-blue-600" />
            {t('footer.copyright')}
          </p>
          <p className="text-gray-500 text-xs">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;