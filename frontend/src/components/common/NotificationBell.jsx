import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Badge, Button, ListGroup, Card } from 'react-bootstrap';
import { fetchNotifications, markAsRead } from '../../services/notifications/notificationService';
import { toast } from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userID');

  const loadNotifications = async () => {
    if (!userId) return;
    try {
      const data = await fetchNotifications(userId);
      
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
    const handleSync = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handleSync);
    const interval = setInterval(loadNotifications, 60000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleSync);
    };
  }, [userId]);

  const handleToggle = (isOpen) => {
    if (isOpen && unreadCount > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
  };

  const handleNotificationClick = (notificationId) => {
    handleMarkAsRead(notificationId);
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
    <Dropdown onToggle={handleToggle} align="end">
      <Dropdown.Toggle 
        variant="light" 
        className="p-3 text-secondary border-0 bg-transparent shadow-none d-flex align-items-center justify-content-center position-relative"
        bsPrefix="p-0"
      >
        <div className={`p-2 rounded-3 hover-bg-light transition-all ${isAnimating ? 'animate-bounce' : ''}`}>
          <FaBell size={22} className={unreadCount > 0 ? 'text-primary' : 'text-secondary'} />
          {unreadCount > 0 && (
            <Badge 
              pill 
              bg="danger" 
              className="position-absolute translate-middle border border-white"
              style={{ top: '15%', left: '85%', fontSize: '0.65rem' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="border-0 shadow-lg p-0 overflow-hidden rounded-3 mt-2" style={{ width: '320px' }}>
        <Card className="border-0">
          <Card.Header className="bg-primary bg-opacity-10 py-3 border-0">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <FaBell className="text-primary" /> Notifications
              </h6>
              {unreadCount > 0 && <Badge bg="primary-subtle" text="primary">{unreadCount} New</Badge>}
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <ListGroup variant="flush" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.filter(n => !n.isRead).length === 0 ? (
                <div className="p-5 text-center text-secondary">
                  <div className="h3 mb-2">✅</div>
                  <p className="small mb-0">All caught up!</p>
                </div>
              ) : (
                notifications
                  .filter(n => !n.isRead)
                  .map((notification) => (
                    <ListGroup.Item 
                      key={notification.id}
                      className="p-3 border-bottom hover-bg-light cursor-pointer transition-all border-0 bg-primary bg-opacity-10 mb-1"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="small fw-bold text-dark mb-1">{notification.title}</h6>
                          <p className="small text-secondary mb-2 line-clamp-2" style={{ fontSize: '0.8rem' }}>
                            {notification.message}
                          </p>
                          <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <div className="p-1 bg-primary rounded-circle ms-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                      </div>
                    </ListGroup.Item>
                  ))
              )}
            </ListGroup>
          </Card.Body>
          <Card.Footer className="bg-light p-3 border-0">
            <Button 
              variant="primary" 
              size="sm" 
              className="w-100 fw-bold rounded-2 py-2"
              onClick={handleViewAll}
            >
              View All Notifications
            </Button>
          </Card.Footer>
        </Card>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;