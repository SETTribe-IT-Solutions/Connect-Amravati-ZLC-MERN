import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { FaMapMarkerAlt, FaBell } from 'react-icons/fa';
import { GiIndiaGate } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, CheckCircleIcon, EyeIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import * as notificationService from '../../services/notifications/notificationService';
import logo1 from '../../assets/images/logo1.png';

const Header = React.memo(({ setSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const { user } = useSelector((state) => state.auth);

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
    if (!userID || isSystemAdministrator) return;

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    const handleUpdate = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleUpdate);
    };
  }, [userID, isSystemAdministrator]);
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



  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white shadow-sm border-bottom sticky-top z-50"
      style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.95)', height: '76px' }}
    >
      {/* Tricolor Top Bar */}
      <div style={{ height: '4px', width: '100%', background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }}></div>

      <div className="container-fluid px-3 px-lg-4" style={{ height: '72px' }}>
        <div className="d-flex align-items-center justify-content-between h-100">
          <div className="d-flex align-items-center gap-3">
            {showHamburger && (
              <button
                type="button"
                className="d-lg-none btn btn-light border-0 p-2 rounded-circle shadow-sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
            )}

            <div className="d-flex align-items-center gap-2">
              <img
                src={logo1}
                alt="Connect Amravati Logo"
                className="img-fluid"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
              <div className="border-start ps-2 ms-1 border-light">
                <h1 className="h5 h4-sm mb-0 fw-bold tracking-tight text-dark" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  District <span className="text-primary">Connect</span>
                </h1>
                <p className="mb-0 text-muted d-none d-md-block" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Official Communication Portal
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 gap-lg-4">
            {/* Notification Bell */}
            {user?.userID && !isSystemAdministrator && (
              <div className="position-relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`btn rounded-circle p-2 position-relative ${showDropdown ? 'btn-primary' : 'btn-light text-secondary'
                    }`}
                  style={{ width: '40px', height: '40px' }}
                >
                  <BellIcon style={{ width: '1.25rem', height: '1.25rem' }} className={isRefreshing && unreadCount > 0 ? 'animate-pulse' : ''} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm border border-white" style={{ fontSize: '0.6rem', padding: '0.35em 0.5em' }}>
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
                      className="position-absolute end-0 mt-3 bg-white rounded-3 shadow-lg border border-light overflow-hidden z-3 notification-dropdown"
                    >
                      <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                        <h6 className="mb-0 fw-bold text-uppercase small tracking-wider">Notifications</h6>
                        <span className="badge rounded-pill bg-primary">
                          {unreadCount} New
                        </span>
                      </div>

                      <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                        {notifications.length === 0 ? (
                          <div className="p-5 text-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                              <BellIcon className="text-muted" style={{ width: '32px', height: '32px' }} />
                            </div>
                            <p className="text-muted small">No new notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif.id}
                              className="p-3 border-bottom border-light hover-bg-light cursor-pointer"
                              style={{ transition: 'background-color 0.2s' }}
                            >
                              <div className="d-flex align-items-start gap-3">
                                <div className={`mt-1 p-2 rounded-circle flex-shrink-0 ${notif.type === 'OVERDUE' ? 'bg-danger bg-opacity-10 text-danger' :
                                    notif.type === 'REMINDER' ? 'bg-warning bg-opacity-10 text-warning' :
                                      'bg-primary bg-opacity-10 text-primary'
                                  }`} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <InformationCircleIcon style={{ width: '16px', height: '16px' }} />
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                  <p className="small fw-bold mb-1 text-dark text-truncate text-uppercase">
                                    {notif.title}
                                  </p>
                                  <p className="small text-muted mb-2 lh-sm">
                                    {notif.message}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setShowDropdown(false);
                                      navigate('/notifications');
                                    }}
                                    className="btn btn-sm btn-outline-primary py-1 px-3 rounded-pill fw-bold"
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    <EyeIcon className="me-1" style={{ width: '12px', height: '12px' }} />
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        onClick={() => navigate('/notifications')}
                        className="btn btn-link w-100 py-3 text-center text-decoration-none small fw-bold text-secondary border-top rounded-0 hover-bg-light"
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
});

export default Header;
