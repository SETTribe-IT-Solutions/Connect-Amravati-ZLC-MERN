import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

<<<<<<< HEAD
const ChangePassword = ({ onPasswordChange, onVerifyPassword, onClose }) => {
=======
const ChangePassword = ({ onPasswordChange, onClose }) => {
>>>>>>> upstream/main
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('change'); // 'change' or 'forgot'
  const [step, setStep] = useState(1); // 1: verify, 2: new password, 3: success
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
    email: '',
    phone: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState('email'); // 'email' or 'phone'

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

  const getStrengthText = () => {
    if (passwordStrength <= 2) return { text: 'Weak', color: 'text-red-500', bg: 'bg-red-500', width: '20%' };
    if (passwordStrength <= 3) return { text: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500', width: '40%' };
    if (passwordStrength <= 4) return { text: 'Good', color: 'text-yellow-500', bg: 'bg-yellow-500', width: '60%' };
    if (passwordStrength <= 5) return { text: 'Strong', color: 'text-green-500', bg: 'bg-green-500', width: '80%' };
    return { text: 'Very Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', width: '100%' };
  };

  // Handle OTP send
  const handleSendOTP = () => {
    const identifier = verificationMethod === 'email' ? formData.email : formData.phone;
    if (!identifier) {
      setErrors({ [verificationMethod]: `${verificationMethod === 'email' ? 'Email' : 'Phone number'} is required` });
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setCountdown(60);
      setIsLoading(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setOtpSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (step === 1) {
      if (activeTab === 'change') {
        if (!formData.currentPassword) {
          newErrors.currentPassword = 'Current password is required';
        }
      } else {
        if (verificationMethod === 'email' && !formData.email) {
          newErrors.email = 'Email is required';
        } else if (verificationMethod === 'phone' && !formData.phone) {
          newErrors.phone = 'Phone number is required';
        }
        if (!formData.otp && otpSent) {
          newErrors.otp = 'OTP is required';
        }
      }
    }

    if (step === 2) {
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (passwordStrength < 3) {
        newErrors.newPassword = 'Password is too weak';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  // Handle next step
<<<<<<< HEAD
  const handleNext = async () => {
=======
  const handleNext = () => {
>>>>>>> upstream/main
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      if (step === 1) {
        if (activeTab === 'change') {
<<<<<<< HEAD
          // Verify current password on the backend
          if (onVerifyPassword) {
            setIsLoading(true);
            try {
              const isValid = await onVerifyPassword(formData.currentPassword);
              if (isValid) {
                setStep(2);
              } else {
                setErrors({ currentPassword: 'Current password is incorrect' });
              }
            } finally {
              setIsLoading(false);
            }
          } else {
            // Fallback if prop not provided
            setStep(2);
=======
          // Verify current password (demo)
          if (formData.currentPassword === 'admin123') {
            setStep(2);
          } else {
            setErrors({ currentPassword: 'Current password is incorrect' });
>>>>>>> upstream/main
          }
        } else {
          // Verify OTP (demo)
          if (formData.otp === '123456') {
            setStep(2);
          } else {
            setErrors({ otp: 'Invalid OTP' });
          }
        }
      } else if (step === 2) {
<<<<<<< HEAD
        // Process password change via actual backend
        setIsLoading(true);
        try {
          if (onPasswordChange) {
            const success = await onPasswordChange(formData.currentPassword, formData.newPassword);
            if (success) {
              setStep(3);
            } else {
              // Error is handled by a toast in App.jsx, but we could also set step back or just let user retry.
              // To retry, we reset the current password step or just keep them here.
            }
          } else {
            setStep(3); // Fallback if no handler provided
          }
        } finally {
          setIsLoading(false);
        }
=======
        // Process password change
        setIsLoading(true);
        setTimeout(() => {
          setStep(3);
          setIsLoading(false);
          if (onPasswordChange) {
            onPasswordChange(formData.currentPassword, formData.newPassword);
          }
        }, 2000);
>>>>>>> upstream/main
      }
    } else {
      setErrors(newErrors);
    }
  };

  // Handle final step
  const handleDone = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/dashboard');
    }
  };

  const strength = getStrengthText();

  // Reset form when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStep(1);
    setOtpSent(false);
    setErrors({});
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      otp: '',
      email: '',
      phone: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4"
          >
            <KeyIcon className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
          <p className="text-gray-600">Reset your password</p>
        </div>

        {/* Tab Switcher - Moved to bottom */}
        

        {/* Main Card */}
        <motion.div
          layout
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Verification */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Verify Your Identity</h2>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'change' 
                        ? 'Enter your current password' 
                        : 'Enter the verification code sent to your registered email/phone'}
                    </p>
                  </div>
                </div>

                {activeTab === 'change' ? (
                  // Change Password Option - Current Password Only
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.currentPassword ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Forgot Password Option - Email/Phone + OTP
                  <div className="space-y-6">
                    {/* Method Selection */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setVerificationMethod('email')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          verificationMethod === 'email'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600'
                        }`}
                      >
                        <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                        Email
                      </button>
                      <button
                        onClick={() => setVerificationMethod('phone')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          verificationMethod === 'phone'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600'
                        }`}
                      >
                        <PhoneIcon className="h-4 w-4 inline mr-1" />
                        Phone
                      </button>
                    </div>

                    {/* Email or Phone Input */}
                    {verificationMethod === 'email' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                              errors.email ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Enter your registered email"
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
<<<<<<< HEAD
                            type="text"
                            value={formData.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setFormData({ ...formData, phone: value });
                            }}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                              errors.phone ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="9876543210"
                            maxLength={10}
=======
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                              errors.phone ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Enter your registered phone number"
>>>>>>> upstream/main
                          />
                        </div>
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                      </div>
                    )}

                    {/* Send OTP Button */}
                    <button
                      onClick={handleSendOTP}
                      disabled={isLoading || otpSent}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50"
                    >
                      {isLoading ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
                      ) : otpSent ? (
                        `Resend OTP in ${countdown}s`
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>

                    {/* OTP Input */}
                    {otpSent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={formData.otp}
                          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest ${
                            errors.otp ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="000000"
                          maxLength="6"
                        />
                        <p className="text-xs text-gray-500 text-center">
                          Please enter the 6-digit verification code sent to your {verificationMethod === 'email' ? 'email inbox' : 'mobile number'}
                        </p>
                        {errors.otp && <p className="mt-1 text-xs text-red-600 text-center">{errors.otp}</p>}
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: New Password */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <LockClosedIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Create New Password</h2>
                    <p className="text-sm text-gray-500">Choose a strong password you haven't used before</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, newPassword: e.target.value });
                          checkPasswordStrength(e.target.value);
                        }}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Password Strength */}
                  {formData.newPassword && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Password strength:</span>
                        <span className={`text-xs font-medium ${strength.color}`}>{strength.text}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: strength.width }}
                          className={`h-full ${strength.bg}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { text: 'At least 8 characters', met: formData.newPassword.length >= 8 },
                        { text: 'Uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
                        { text: 'Number', met: /[0-9]/.test(formData.newPassword) },
                        { text: 'Special character', met: /[^A-Za-z0-9]/.test(formData.newPassword) }
                      ].map((req, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          <CheckCircleIcon className={`h-3 w-3 mr-1 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <CheckCircleIcon className="h-12 w-12 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed!</h2>
                <p className="text-gray-600 mb-6">Your password has been updated successfully</p>

                <button
                  onClick={handleDone}
                  className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tab Switcher - Now at bottom */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-1 mt-6 shadow-lg">
          <div className="flex gap-1">
            <button
              onClick={() => handleTabChange('change')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'change'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => handleTabChange('forgot')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'forgot'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Forgot Password
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;