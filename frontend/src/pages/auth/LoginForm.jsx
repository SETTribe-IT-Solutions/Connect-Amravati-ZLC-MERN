import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaArrowRight, FaBell, FaShieldAlt, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "../../context/LanguageContext";
import { loginUser } from "../../services/authService";

const LoginForm = ({ showToast }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showToast(t('login.error_required'), 'error');
      return;
    }

    setLoading(true);

    // ✅ Hardcoded login for frontend team
    if (formData.username === "adminn" && formData.password === "admin1233") {

      setTimeout(() => {
        const role = "collector";

        localStorage.setItem("role", role);

        showToast(t('login.success'), 'success');

        setLoading(false);

        navigate("/dashboard", {
          state: {
            role: role,
            username: formData.username
          }
        });

      }, 1000);

      return; // stop API call
    }

    // ✅ Backend login
    try {
      const data = await loginUser(formData.username, formData.password);

      console.log("API Response:", data);

      setTimeout(() => {

        if (data.message === "Login Successful") {

          const role =
            data.role === "ADMIN"
              ? "collector"
              : data.role === "SDO"
                ? "sdo"
                : "user";

          localStorage.setItem("role", role);

          showToast(t('login.success'), 'success');

          setLoading(false);

          navigate("/dashboard", {
            state: {
              role: role,
              username: formData.username
            }
          });

        } else {
          showToast(t('login.error_invalid'), 'error');
          setLoading(false);
        }

      }, 1500);

    } catch (error) {
      console.error("Login Error:", error.response || error.message);
      showToast(t('login.error_invalid'), 'error');
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="lg:w-1/2 p-8 lg:p-12"
    >
      <div className="max-w-md mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
          <FaShieldAlt className="mr-3 text-blue-600" />
          {t('login.title')}
        </h2>
        <p className="text-gray-600 mb-8 pl-12">
          {t('login.subtitle')}
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
              {t('login.username')}
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
              {t('login.password')}
            </label>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-end">
              {t('login.forgot_password')} <FaArrowRight className="ml-1 text-xs" />
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
                <span>{t('login.logging_in')}</span>
              </>
            ) : (
              <>
                <span>{t('login.login_button')}</span>
                <FaArrowRight />
              </>
            )}
          </button>

          {/* Demo Credentials */}
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-100">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FaBell className="mr-2 text-blue-600 animate-pulse" />
              {t('demo.title')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setFormData({ username: 'dist_admin', password: 'password123' })}
              >
                <span className="text-xs text-blue-700 block">Collector</span>
                <span className="text-xs font-mono">dist_admin / password</span>
              </div>
              <div
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setFormData({ username: 'sdo_user', password: 'password123' })}
              >
                <span className="text-xs text-green-700 block">SDO</span>
                <span className="text-xs font-mono">sdo_user / password</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center mt-6 flex items-center justify-center">
            <FaShieldAlt className="mr-1" />
            {t('security.notice')}
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default LoginForm;
