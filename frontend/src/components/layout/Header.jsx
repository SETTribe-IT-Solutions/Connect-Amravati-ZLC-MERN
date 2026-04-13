import React, { useState, useEffect, useRef } from 'react';

import { FaMapMarkerAlt, FaBell } from 'react-icons/fa';
import { GiIndiaGate } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, CheckCircleIcon, EyeIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import * as notificationService from '../../services/notificationService';

const Header = ({ setSidebarOpen, isCollapsed, setIsCollapsed, user }) => {

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current user ID and normalized role
  const userID = user?.userID;
  const normalizedRole = user?.role?.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isSystemAdministrator = normalizedRole === 'SYSTEMADMINISTRATOR';

  // Show hamburger only on protected/dashboard pages
  const showHamburger = !['/login', '/register'].some(path => location.pathname.startsWith(path));

  // Fetch notifications
  const loadNotifications = async () => {
    if (!userID || isSystemAdministrator) return;
    try {
      setIsRefreshing(true);
      const data = await notificationService.fetchNotifications(userID);
      // Filter for unread only just in case backend returns all
      const unread = data.filter(n => !n.isRead);
      setNotifications(unread);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    const handleUpdate = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleUpdate);
    };
  }, [userID]);
  // Close dropdown when route changes so it returns to its original position
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);
  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      // Instantly remove from UI as requested
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Perform API call in background
      await notificationService.markAsRead(id, userID);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Refresh to sync if it fails
      loadNotifications();
    }
  };

  const handleViewDetails = (taskId) => {
    setShowDropdown(false);
    if (taskId) {
      // Navigate to tasks and pass taskId as query param
      navigate(`/tasks?highlightId=${taskId}`);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 w-full"
    >
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showHamburger && (
              <>
                <button
                  type="button"
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  className="hidden lg:flex p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              </>
            )}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl lg:text-4xl text-blue-900"
            >
              <GiIndiaGate />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-700 to-green-600 bg-clip-text text-transparent leading-tight lowercase">
                <span className="capitalize">Amravati Connect</span>
              </h1>
              <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 flex items-center">
                <FaMapMarkerAlt className="mr-1 text-blue-600" />
                Collector Office, Amravati
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-5">
            {/* Notification Bell */}
            {user?.userID && !isSystemAdministrator && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`p-2 rounded-full transition-all duration-300 relative ${
                    showDropdown ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <BellIcon className={`h-6 w-6 ${isRefreshing && unreadCount > 0 ? 'animate-pulse' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce-short">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed inset-x-4 md:absolute md:inset-x-auto md:right-0 mt-3 w-auto md:w-80 lg:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
                    >
                      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Notifications</h3>
                        <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {unreadCount} New
                        </span>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BellIcon className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm">No new notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 2).map((notif) => (
                            <div
                              key={notif.id}
                              className="p-4 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-default group relative"
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                                  notif.type === 'OVERDUE' ? 'bg-red-50 text-red-500' :
                                  notif.type === 'REMINDER' ? 'bg-orange-50 text-orange-500' :
                                  'bg-blue-50 text-blue-500'
                                }`}>
                                  <InformationCircleIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <div className="mt-3">
                                    <button
                                      onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/notifications');
                                      }}
                                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/50"
                                    >
                                      <EyeIcon className="h-3 w-3" />
                                      <span>View Details</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <button 
                        onClick={() => navigate('/notifications')}
                        className="w-full py-3 text-center text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors border-t border-gray-50"
                      >
                        See All Notifications
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
