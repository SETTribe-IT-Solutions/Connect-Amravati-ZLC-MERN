import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, ProgressBar, Badge, Spinner, Stack } from 'react-bootstrap';

const ChangePassword = ({ 
  onPasswordChange, 
  onVerifyPassword, 
  onVerifyEmail, 
  onForgotPassword, 
  onClose,
  mode = 'change' // 'change' or 'forgot'
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: verify, 2: new password, 3: success
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isForgotMode = mode === 'forgot';

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (password.length >= 12) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthData = () => {
    if (passwordStrength <= 2) return { text: 'Weak', variant: 'danger', value: 20 };
    if (passwordStrength <= 3) return { text: 'Fair', variant: 'warning', value: 40 };
    if (passwordStrength <= 4) return { text: 'Good', variant: 'info', value: 70 };
    return { text: 'Strong', variant: 'success', value: 100 };
  };

  const strength = getStrengthData();

  const validateForm = () => {
    const newErrors = {};
    if (step === 1) {
      if (isForgotMode) {
        if (!formData.email) {
          newErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      } else {
        if (!formData.currentPassword) {
          newErrors.currentPassword = 'Current password is required';
        }
      }
    }
    if (step === 2) {
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    return newErrors;
  };

  const handleNext = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      if (step === 1) {
        setIsLoading(true);
        try {
          // Always use email verification for step 1
          if (onVerifyEmail) {
            const isValid = await onVerifyEmail(formData.email);
            if (isValid) setStep(2);
            else setErrors({ email: 'Email ID does not match our records' });
          } else {
            setStep(2);
          }
        } finally {
          setIsLoading(false);
        }
      } else if (step === 2) {
        setIsLoading(true);
        try {
          if (isForgotMode) {
            if (onForgotPassword) {
              const success = await onForgotPassword(formData.email, formData.newPassword);
              if (success) setStep(3);
            } else setStep(3);
          } else {
            if (onPasswordChange) {
              const success = await onPasswordChange(formData.currentPassword, formData.newPassword);
              if (success) setStep(3);
            } else setStep(3);
          }
        } finally {
          setIsLoading(false);
        }
      }
    } else setErrors(newErrors);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-100"
        style={{ maxWidth: '500px' }}
      >
        <div className="text-center mb-5">
          <h1 className="display-6 fw-bold text-dark mb-2 font-outfit">
            {isForgotMode ? 'Reset Password' : 'Change Password'}
          </h1>
          <p className="text-secondary lead">
            Securely update your credentials via email verification
          </p>
        </div>

        <Card className="border-0 shadow-lg rounded-4 overflow-hidden bg-white bg-opacity-75 backdrop-blur">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 p-md-5"
              >
                <div className="d-flex align-items-center gap-3 mb-5">
                  <div className="p-3 bg-primary bg-opacity-10 rounded-3">
                    <ArrowPathIcon style={{ width: '1.5rem' }} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Verify Email</h5>
                    <p className="small text-secondary mb-0">Enter your registered email address to continue</p>
                  </div>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-secondary text-uppercase mb-2">Email Address</Form.Label>
                  <div className="position-relative">
                    <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        email: e.target.value 
                      })}
                      placeholder="Enter your registered email"
                      className={`ps-5 py-3 rounded-3 border-2 shadow-none focus-border-primary ${
                        errors.email ? 'border-danger' : ''
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-danger small mt-3 mb-0 fw-bold animate-pulse">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {errors.email}
                    </p>
                  )}
                </Form.Group>

                <div className="d-flex justify-content-end mt-5">
                  <Button 
                    variant="primary" 
                    onClick={handleNext} 
                    disabled={isLoading}
                    className="px-5 py-3 fw-bold rounded-3 shadow-sm gradient-button-premium border-0"
                  >
                    {isLoading ? <Spinner size="sm" /> : 'Continue'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 p-md-5"
              >
                <div className="d-flex align-items-center gap-3 mb-5">
                  <div className="p-3 bg-success bg-opacity-10 rounded-3">
                    <LockClosedIcon style={{ width: '1.5rem' }} className="text-success" />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Create New Password</h5>
                    <p className="small text-secondary mb-0">Choose a strong, unique password</p>
                  </div>
                </div>

                <Stack gap={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary text-uppercase mb-2">New Password</Form.Label>
                    <div className="position-relative">
                      <LockClosedIcon style={{ width: '1.25rem' }} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                      <Form.Control
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, newPassword: e.target.value });
                          checkPasswordStrength(e.target.value);
                        }}
                        className={`ps-5 py-3 rounded-3 border-2 shadow-none focus-border-primary ${errors.newPassword ? 'border-danger' : ''}`}
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 translate-middle-y end-0 me-2 text-muted p-2 border-0 shadow-none"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeSlashIcon style={{ width: '1.25rem' }} /> : <EyeIcon style={{ width: '1.25rem' }} />}
                      </Button>
                    </div>
                    {errors.newPassword && <p className="text-danger small mt-2 mb-0">{errors.newPassword}</p>}
                  </Form.Group>

                  {formData.newPassword && (
                    <div className="p-3 bg-light rounded-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-secondary fw-bold">STRENGTH:</span>
                        <Badge bg={strength.variant} className="text-uppercase">{strength.text}</Badge>
                      </div>
                      <ProgressBar 
                        variant={strength.variant} 
                        now={strength.value} 
                        style={{ height: '6px' }} 
                        className="bg-white"
                      />
                    </div>
                  )}

                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary text-uppercase mb-2">Confirm Password</Form.Label>
                    <div className="position-relative">
                      <LockClosedIcon style={{ width: '1.25rem' }} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                      <Form.Control
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`ps-5 py-3 rounded-3 border-2 shadow-none focus-border-primary ${errors.confirmPassword ? 'border-danger' : ''}`}
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 translate-middle-y end-0 me-2 text-muted p-2 border-0 shadow-none"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeSlashIcon style={{ width: '1.25rem' }} /> : <EyeIcon style={{ width: '1.25rem' }} />}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-danger small mt-2 mb-0">{errors.confirmPassword}</p>}
                  </Form.Group>
                </Stack>

                <div className="d-flex justify-content-between mt-5 gap-3">
                  <Button 
                    variant="light" 
                    onClick={() => setStep(1)}
                    className="flex-grow-1 py-3 fw-bold rounded-3 border bg-white"
                  >
                    <ArrowLeftIcon style={{ width: '1.1rem' }} className="me-2" /> Back
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={handleNext} 
                    disabled={isLoading}
                    className="flex-grow-1 py-3 fw-bold rounded-3 shadow-sm border-0"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {isLoading ? <Spinner size="sm" /> : 'Update Password'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 text-center"
              >
                <div className="bg-success bg-opacity-10 p-4 rounded-circle d-inline-flex mb-4">
                  <CheckCircleIcon style={{ width: '4rem' }} className="text-success" />
                </div>
                <h3 className="fw-bold text-dark mb-2">Success!</h3>
                <p className="text-secondary mb-5">Your password has been changed successfully.</p>
                <Button
                  variant="primary"
                  onClick={() => onClose ? onClose() : navigate('/dashboard')}
                  className="w-100 py-3 fw-bold rounded-3 shadow-sm gradient-button-premium border-0"
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ChangePassword;