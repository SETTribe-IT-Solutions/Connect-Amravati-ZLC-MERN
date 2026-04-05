import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaCheck, FaTimes, FaFilter, FaExternalLinkAlt } from 'react-icons/fa';
import { fetchNotifications, markAsRead } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const userId = localStorage.getItem('userID');
  const navigate = useNavigate();

  const loadNotifications = async () => {
    if (!userId) return;
    try {
      const data = await fetchNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      await markAsRead(notificationId, userId);
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark notification as read');
      // Rollback on error
      loadNotifications();
    }
  };

  const handleViewDetails = (notification) => {
    if (notification.task && (notification.task.id || notification.taskId)) {
      const taskId = notification.task.id || notification.taskId;
      navigate(`/tasks?taskId=${taskId}`);
    } else {
      toast.error('No task details available for this notification');
    }
  };

  const handleMarkMultipleAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await Promise.all(
        selectedNotifications.map(id => markAsRead(id, userId))
      );
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      setNotifications(prev =>
        prev.map(n => selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n)
      );
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications marked as read`);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    const unreadIds = filteredNotifications.filter(n => !n.isRead).map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === unreadIds.length ? [] : unreadIds
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_TASK':
      case 'TASK_ASSIGNED':
        return '📋';
      case 'COMPLETED':
      case 'TASK_COMPLETED':
        return '✅';
      case 'DUE':
      case 'TASK_DUE_SOON':
        return '⏰';
      case 'OVERDUE':
      case 'TASK_OVERDUE':
        return '⚠️';
      case 'REASSIGNED':
      case 'TASK_REASSIGNED':
        return '🔄';
      case 'ANNOUNCEMENT':
        return '📢';
      case 'APPRECIATION':
        return '🏆';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl mr-4"
          >
            🔔
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with your tasks and activities</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📬</div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔵</div>
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => !n.isRead).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📖</div>
              <div>
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.isRead).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {selectedNotifications.length === filteredNotifications.filter(n => !n.isRead).length
                  ? 'Deselect All'
                  : 'Select All Unread'}
              </button>
              <button
                onClick={handleMarkMultipleAsRead}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
              >
                <FaCheck className="mr-2" />
                Mark Selected as Read ({selectedNotifications.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? "Great! You've read all your notifications."
                : "You don't have any notifications yet."}
            </p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${!notification.isRead ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-300'
                } p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                      <div className="flex items-center space-x-3">
                        {(notification.task || notification.taskId) && (
                          <button
                            onClick={() => {
                                const tId = notification.taskId || (notification.task && notification.task.id);
                                navigate(`/tasks?highlightId=${tId}`);
                            }}
                            className="inline-flex items-center px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors font-bold shadow-sm"
                          >
                            <FaExternalLinkAlt className="mr-2 h-3 w-3" />
                            View Details
                          </button>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="inline-flex items-center px-4 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors font-bold shadow-sm"
                          >
                            <FaCheck className="mr-2" />
                            Mark as Read
                          </button>
                        )}
                        {filter === 'all' && !notification.isRead && (
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;