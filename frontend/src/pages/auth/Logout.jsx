import React, { useState } from 'react';
import { Modal, Button, Spinner, Stack, Badge } from 'react-bootstrap';
import { 
  ArrowRightOnRectangleIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Logout = ({ onLogout, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 1500);
    }, 1500);
  };

  return (
    <Modal 
      show={true} 
      onHide={onClose} 
      centered 
      backdrop="static" 
      keyboard={false}
      className="logout-modal"
    >
      {isSuccess ? (
        <Modal.Body className="p-5 text-center">
          <div className="bg-success bg-opacity-10 p-4 rounded-circle d-inline-flex mb-4">
            <CheckCircleIcon style={{ width: '3rem' }} className="text-success" />
          </div>
          <h3 className="fw-bold text-dark mb-2">Logged Out Successfully!</h3>
          <p className="text-secondary mb-0">Redirecting to login page...</p>
        </Modal.Body>
      ) : isProcessing ? (
        <Modal.Body className="p-5 text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3.5rem', height: '3.5rem' }} className="mb-4" />
          <h3 className="fw-bold text-dark mb-2">Logging out...</h3>
          <p className="text-secondary mb-0">Please wait, clearing your session...</p>
        </Modal.Body>
      ) : (
        <>
          <Modal.Header className="bg-primary text-white border-0 p-4">
            <div className="d-flex align-items-center gap-3 w-100">
              <div className="p-2 bg-white bg-opacity-20 rounded-3">
                <ArrowRightOnRectangleIcon style={{ width: '1.5rem' }} className="text-white" />
              </div>
              <Modal.Title className="fw-bold h5 mb-0">Ready to Leave?</Modal.Title>
              <Button 
                variant="link" 
                onClick={onClose} 
                className="text-white p-0 ms-auto border-0 shadow-none"
              >
                <XMarkIcon style={{ width: '1.5rem' }} />
              </Button>
            </div>
          </Modal.Header>
          
          <Modal.Body className="p-4 p-md-5">
            <div className="bg-light p-4 rounded-4 mb-4 border border-light-subtle">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-white rounded-3 shadow-sm text-primary fw-bold">
                  2h 30m
                </div>
                <div>
                  <p className="small text-secondary fw-semibold mb-0">Session Duration</p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    <ClockIcon style={{ width: '0.8rem' }} className="me-1" />
                    Logged in at 09:30 AM
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-secondary lead mb-2">Are you sure you want to logout?</p>
              <div className="d-flex align-items-center gap-2 text-danger small fw-bold">
                <ExclamationTriangleIcon style={{ width: '1rem' }} />
                <span>You have 3 pending tasks for today.</span>
              </div>
            </div>
            
            <Stack direction="horizontal" gap={3}>
              <Button
                variant="light"
                onClick={onClose}
                className="flex-grow-1 py-2 fw-bold rounded-3 border bg-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleLogout}
                className="flex-grow-1 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none' }}
              >
                <ArrowRightOnRectangleIcon style={{ width: '1.25rem' }} />
                Logout
              </Button>
            </Stack>
          </Modal.Body>

          <Modal.Footer className="bg-light border-0 py-3 justify-content-center">
            <p className="small text-muted mb-0" style={{ fontSize: '0.7rem' }}>
              Your session will automatically expire after 4 hours of inactivity.
            </p>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default Logout;