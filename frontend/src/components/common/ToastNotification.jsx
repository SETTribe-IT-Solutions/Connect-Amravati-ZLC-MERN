import React, { useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const ToastNotification = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const config = {
    success: {
      icon: <CheckCircleIcon style={{ width: '1.25rem' }} className="text-success" />,
      bg: 'success',
      title: 'Success'
    },
    error: {
      icon: <XCircleIcon style={{ width: '1.25rem' }} className="text-danger" />,
      bg: 'danger',
      title: 'Error'
    },
    info: {
      icon: <InformationCircleIcon style={{ width: '1.25rem' }} className="text-info" />,
      bg: 'info',
      title: 'Information'
    }
  };

  const currentConfig = config[type || 'info'];

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast show={isVisible} onClose={onClose} className="border-0 shadow-lg rounded-3 overflow-hidden">
        <Toast.Header className="bg-white border-0 py-2">
          <div className="d-flex align-items-center gap-2 me-auto">
            {currentConfig.icon}
            <strong className="fw-bold" style={{ fontSize: '0.9rem' }}>{currentConfig.title}</strong>
          </div>
        </Toast.Header>
        <Toast.Body className={`bg-white p-3 ${type === 'error' ? 'text-danger' : type === 'success' ? 'text-success' : 'text-primary'} fw-medium`} style={{ fontSize: '0.9rem' }}>
          {message}
        </Toast.Body>
        <div className={`bg-${currentConfig.bg}`} style={{ height: '3px', width: isVisible ? '100%' : '0%', transition: 'width 3s linear' }}></div>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;