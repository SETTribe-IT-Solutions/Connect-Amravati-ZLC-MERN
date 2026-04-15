import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const showingFrom = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const showingTo = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-gray-500 font-medium order-2 sm:order-1">
        Showing <span className="font-bold text-gray-900">{showingFrom}</span> to <span className="font-bold text-gray-900">{showingTo}</span> of <span className="font-bold text-gray-900">{totalItems}</span> items
      </div>
      
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`p-2 rounded-xl border transition-all ${
            currentPage === 1 
              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'
          }`}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </motion.button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((number) => (
            <motion.button
              key={number}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(number)}
              className={`min-w-[40px] h-10 px-3 rounded-xl font-bold text-sm transition-all ${
                currentPage === number
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border border-blue-600'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {number}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`p-2 rounded-xl border transition-all ${
            currentPage === totalPages 
              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'
          }`}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;
