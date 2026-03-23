import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  FingerPrintIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ChangePassword = ({ onPasswordChange, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: verification, 2: new password, 3: success
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
    securityQuestion: 'What is your favorite color?',
    securityAnswer: ''
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
    setIsLoading(true);
    // Simulate OTP send
    setTimeout(() => {
      setOtpSent(true);
      setCountdown(60);
      setIsLoading(false);
      // Start countdown
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
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!formData.securityAnswer) {
        newErrors.securityAnswer = 'Security answer is required';
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

      if (!formData.otp && otpSent) {
        newErrors.otp = 'OTP is required';
      }
    }

    return newErrors;
  };

  // Handle next step
  const handleNext = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      if (step === 1) {
        // Verify current password (demo)
        if (formData.currentPassword === 'admin123') {
          setStep(2);
        } else {
          setErrors({ currentPassword: 'Current password is incorrect' });
        }
      } else if (step === 2) {
        // Process password change
        setIsLoading(true);
        setTimeout(() => {
          setStep(3);
          setIsLoading(false);
          if (onPasswordChange) {
            onPasswordChange(formData.currentPassword, formData.newPassword);
          }
        }, 2000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header with Steps */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4"
          >
            <KeyIcon className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
          <p className="text-gray-600">Secure your account with a strong password</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: step >= i ? 1 : 0.8,
                    backgroundColor: step >= i ? '#2563eb' : '#e5e7eb'
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${step >= i ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                >
                  {step > i ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    i
                  )}
                </motion.div>
                <span className="text-xs mt-2 text-gray-600">
                  {i === 1 ? 'Verify' : i === 2 ? 'New Password' : 'Success'}
                </span>
              </div>
              {i < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > i ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
              )}
            </React.Fragment>
          ))}
        </div>

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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Verify Your Identity</h2>
                    <p className="text-sm text-gray-500">Please confirm your credentials</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Current Password */}
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
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${errors.currentPassword ? 'border-red-500' : 'border-gray-200'
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

                  {/* Security Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Question
                    </label>
                    <select
                      value={formData.securityQuestion}
                      onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option>What is your favorite color?</option>
                      <option>What is your mother's maiden name?</option>
                      <option>What was your first pet's name?</option>
                      <option>What city were you born in?</option>
                    </select>
                  </div>

                  {/* Security Answer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer
                    </label>
                    <input
                      type="text"
                      value={formData.securityAnswer}
                      onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.securityAnswer ? 'border-red-500' : 'border-gray-200'
                        }`}
                      placeholder="Enter your answer"
                    />
                    {errors.securityAnswer && (
                      <p className="mt-1 text-xs text-red-600">{errors.securityAnswer}</p>
                    )}
                  </div>

                  {/* 2FA Option */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-500">Get OTP on your registered mobile</p>
                        </div>
                      </div>
                      <button
                        onClick={handleSendOTP}
                        disabled={isLoading || otpSent}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${otpSent
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                        {isLoading ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : otpSent ? (
                          `Resend in ${countdown}s`
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* OTP Input (shown after sending) */}
                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map((digit) => (
                          <input
                            key={digit}
                            type="text"
                            maxLength="1"
                            className="w-10 h-12 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FingerPrintIcon className="h-6 w-6 text-green-600" />
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
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.newPassword ? 'border-red-500' : 'border-gray-200'
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

                  {/* Password Strength Meter */}
                  {formData.newPassword && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
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
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
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
                    <p className="text-xs font-medium text-gray-700 mb-3">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { text: 'At least 8 characters', met: formData.newPassword.length >= 8 },
                        { text: 'Uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
                        { text: 'Number', met: /[0-9]/.test(formData.newPassword) },
                        { text: 'Special character', met: /[^A-Za-z0-9]/.test(formData.newPassword) },
                        { text: 'At least 12 chars (bonus)', met: formData.newPassword.length >= 12 },
                        { text: 'No common patterns', met: !/(password|123|qwerty)/i.test(formData.newPassword) }
                      ].map((req, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${req.met ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                            {req.met && <CheckCircleIcon className="h-3 w-3 text-white" />}
                          </span>
                          <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Last Changed Info */}
                  <div className="flex items-center text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <span>Last password change: 45 days ago</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  >
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

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last changed:</span>
                    <span className="font-medium text-gray-900">Just now</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Next change recommended:</span>
                    <span className="font-medium text-gray-900">In 60 days</span>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="text-left bg-yellow-50 p-4 rounded-xl mb-6">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    Security Tips
                  </h3>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Never share your password with anyone</li>
                    <li>• Use different passwords for different accounts</li>
                    <li>• Enable two-factor authentication for extra security</li>
                    <li>• Change your password every 60 days</li>
                  </ul>
                </div>

                <button
                  onClick={handleDone}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Having trouble? <button className="text-blue-600 hover:underline">Contact Support</button></p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;