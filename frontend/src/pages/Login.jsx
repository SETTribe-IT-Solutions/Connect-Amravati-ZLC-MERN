import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaArrowRight, FaBell, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../api/authService';
import { toast } from 'react-hot-toast';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/landing/AnimatedBackground';
import WelcomeOverlay from '../components/landing/WelcomeOverlay';
import CulturalSection from '../components/landing/CulturalSection';

const LoginPage = ({ onLogin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isWelcomeActive, setIsWelcomeActive] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error(t('Please fill in all fields') || 'Please fill in all fields');
      return;
    }

    setLoading(true);

    // Try onLogin from props if provided (from App.jsx)
    if (onLogin) {
      const success = onLogin(formData);
      if (success) {
        toast.success(t('Login successful') || 'Login successful');
        setLoading(false);
        navigate('/dashboard');
        return;
      }
    }

    // Fallback to authService
    try {
      const data = await loginUser(formData.username, formData.password);

      if (data.message === "Login Successful") {
        const role =
          data.role === "ADMIN"
            ? "collector"
            : data.role === "SDO"
              ? "sdo"
              : "user";

        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");

        toast.success(t('Login successful') || 'Login successful');
        setLoading(false);
        navigate("/dashboard");
      } else {
        toast.error(t('Invalid credentials') || 'Invalid credentials');
        setLoading(false);
      }
    } catch (error) {
      console.error("Login Error:", error.response || error.message);
      toast.error(t('login.error_invalid') || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden flex flex-col">
      <AnimatedBackground />
      <WelcomeOverlay onComplete={() => setIsWelcomeActive(false)} />
      {!isWelcomeActive && <Header />}

      <main className="container mx-auto px-4 py-12 relative z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50">
            <div className="flex flex-col lg:flex-row">
              <CulturalSection />

              {/* Login Form */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="lg:w-1/2 p-8 lg:p-12"
              >
                <div className="max-w-md mx-auto">
                  <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                    <FaShieldAlt className="mr-3 text-blue-600" />
                    {t('Login') || 'Login'}
                  </h2>
                  <p className="text-gray-600 mb-8 pl-12">
                    {t('Access your dashboard securely') || 'Access your dashboard securely'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Field */}
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-xl z-10" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        className="input-field"
                        placeholder=" "
                      />
                      <label className={`floating-label ${focusedField === 'username' || formData.username ? 'active' : ''}`}>
                        {t('Username') || 'Username'}
                      </label>
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-xl z-10" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="input-field"
                        placeholder=" "
                      />
                      <label className={`floating-label ${focusedField === 'password' || formData.password ? 'active' : ''}`}>
                        {t('Password') || 'Password'}
                      </label>
                    </div>

                    {/* Forgot Password */}
                    <div className="text-right">
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-end">
                        {t('Forgot Password') || 'Forgot Password?'} <FaArrowRight className="ml-1 text-xs" />
                      </a>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="gradient-button"
                    >
                      {loading ? (
                        <>
                          <div className="spinner" />
                          <span>{t('Logging in...') || 'Logging in...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('login') || 'Login'}</span>
                          <FaArrowRight />
                        </>
                      )}
                    </button>

                    {/* Demo Credentials */}
                    <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <FaBell className="mr-2 text-blue-600 animate-pulse" />
                        {t('demo.title') || 'Demo Credentials'}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-blue-50"
                          onClick={() => setFormData({ username: 'collector', password: 'admin123' })}
                        >
                          <span className="text-xs text-blue-700 block font-bold text-center">{t('demo.admin') || 'Collector'}</span>
                          <span className="text-[10px] text-gray-500 block text-center">collector / admin123</span>
                        </div>
                        <div
                          className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-green-50"
                          onClick={() => setFormData({ username: 'sdo_user', password: 'password123' })}
                        >
                          <span className="text-xs text-green-700 block font-bold text-center">{t('demo.employee') || 'SDO'}</span>
                          <span className="text-[10px] text-gray-500 block text-center">sdo_user / password123</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <p className="text-xs text-gray-500 text-center mt-6 flex items-center justify-center">
                      <FaShieldAlt className="mr-1" />
                      {t('This is a secure government portal. Unauthorized access is prohibited.') || 'This is a secure government portal. Unauthorized access is prohibited.'}
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;