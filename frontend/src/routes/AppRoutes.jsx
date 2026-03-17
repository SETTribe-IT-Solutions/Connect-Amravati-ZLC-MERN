import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ToastNotification from '../components/common/ToastNotification';
import LoginPage from '../pages/auth/LoginPage';
import Dashboard from '../pages/dashboard/Dashboard';

const AppRoutes = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'info' });
  };

  return (
    <>
      <ToastNotification
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <Routes>
        <Route path="/" element={<LoginPage showToast={showToast} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
