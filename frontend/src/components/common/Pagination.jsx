import React from 'react';
import { Button, Nav } from 'react-bootstrap';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = React.memo(({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 py-3 px-1">
      <div className="text-secondary small fw-medium order-2 order-sm-1 font-outfit">
        Showing <span className="fw-bold text-dark">{showingFrom}</span> to <span className="fw-bold text-dark">{showingTo}</span> of <span className="fw-bold text-dark">{totalItems}</span> items
      </div>
      
      <Nav className="gap-1 order-1 order-sm-2">
        <Button
          variant="light"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`p-2 rounded-3 border-light-subtle d-flex align-items-center justify-content-center transition-all shadow-sm ${
            currentPage === 1 ? 'opacity-50' : 'bg-white hover-bg-primary hover-text-white'
          }`}
          style={{ width: '40px', height: '40px' }}
        >
          <ChevronLeftIcon style={{ width: '1.25rem' }} />
        </Button>

        <div className="d-flex gap-1 mx-1">
          {getPageNumbers().map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "primary" : "light"}
              onClick={() => onPageChange(number)}
              className={`rounded-3 fw-bold small transition-all ${
                currentPage === number ? 'shadow-sm' : 'bg-white border-light-subtle hover-bg-primary hover-text-white'
              }`}
              style={{ minWidth: '40px', height: '40px' }}
            >
              {number}
            </Button>
          ))}
        </div>

        <Button
          variant="light"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`p-2 rounded-3 border-light-subtle d-flex align-items-center justify-content-center transition-all shadow-sm ${
            currentPage === totalPages ? 'opacity-50' : 'bg-white hover-bg-primary hover-text-white'
          }`}
          style={{ width: '40px', height: '40px' }}
        >
          <ChevronRightIcon style={{ width: '1.25rem' }} />
        </Button>
      </Nav>
    </div>
  );
});

export default Pagination;
