import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchNotifications, markAsRead } from '../../services/notificationService';
import { toast } from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userID');

  const loadNotifications = async () => {
    if (!userId) return;
    try {
      const data = await fetchNotifications(userId);
      
      // Check for new notifications to show toasts
      const unread = data.filter(n => !n.isRead);
      if (notifications.length > 0) {
        const newNotifications = unread.filter(n => !notifications.find(prev => prev.id === n.id));
        newNotifications.forEach(n => {
          toast(n.message, {
            icon: '🔔',
            duration: 4000,
            position: 'top-right',
          });
        });
      }
      
      setNotifications(data);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Listen for manual sync events from other components
    const handleSync = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handleSync);
    
    // Poll every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleSync);
    };
  }, [userId]);

  const handleBellClick = () => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
    setShowDropdown(!showDropdown);
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/notifications');
  };

  const handleNotificationClick = (notificationId) => {
    handleMarkAsRead(notificationId);
    setShowDropdown(false);
    navigate('/notifications');
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId, userId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleBellClick}
        className="relative p-3 text-gray-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:shadow-lg group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnimating ? {
          rotate: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.6 }
        } : {}}
      >
        <motion.div
          animate={unreadCount > 0 ? {
            scale: [1, 1.2, 1],
            transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
          } : {}}
        >
          <FaBell className={`h-6 w-6 transition-colors duration-300 ${
            unreadCount > 0
              ? 'text-blue-600 group-hover:text-blue-700'
              : 'text-gray-600 group-hover:text-blue-600'
          }`} />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaBell className="mr-2 text-blue-600" />
                Notifications
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaTimes className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {notifications.filter(n => !n.isRead).length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications
                .filter(n => !n.isRead)
                .slice(0, 2)
                .map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors bg-blue-50"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleViewAll}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default NotificationBell;