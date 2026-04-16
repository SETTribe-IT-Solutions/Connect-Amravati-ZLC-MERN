import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Badge, Button, 
  Form, Spinner, Stack, InputGroup 
} from 'react-bootstrap';
import { 
  CheckCircleIcon, 
  BellIcon, 
  FunnelIcon, 
  ArrowTopRightOnSquareIcon,
  InboxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { fetchNotifications, markAsRead } from '../../services/notifications/notificationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const userId = localStorage.getItem('userID');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      await markAsRead(notificationId, userId);
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark notification as read');
      loadNotifications();
    }
  };

  const handleViewDetails = (notification) => {
    const taskId = notification.taskId || notification.task?.id;
    if (taskId) {
      navigate(`/tasks?highlightId=${taskId}`);
    } else {
      toast.error('No task details available for this notification');
    }
  };

  const handleMarkMultipleAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    try {
      await Promise.all(selectedNotifications.map(id => markAsRead(id, userId)));
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
      case 'unread': return !notification.isRead;
      case 'read': return notification.isRead;
      default: return true;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    else if (diffDays === 2) return 'Yesterday';
    else if (diffDays <= 7) return `${diffDays - 1} days ago`;
    else return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_TASK': return '📋';
      case 'COMPLETED': return '✅';
      case 'DUE': return '⏰';
      case 'OVERDUE': return '⚠️';
      case 'ANNOUNCEMENT': return '📢';
      case 'APPRECIATION': return '🏆';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="p-4 p-lg-5 bg-light min-vh-100">
      {/* Header */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="p-3 bg-primary bg-opacity-10 rounded-4">
            <BellIcon style={{ width: '2.5rem' }} className="text-primary" />
          </div>
          <div>
            <h1 className="display-6 fw-bold text-primary mb-1 font-outfit">Notifications</h1>
            <p className="text-secondary mb-0">Stay updated with your tasks and activities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          {[
            { label: 'Total', value: notifications.length, icon: InboxIcon, color: 'secondary' },
            { label: 'Unread', value: notifications.filter(n => !n.isRead).length, icon: EnvelopeIcon, color: 'primary' },
            { label: 'Read', value: notifications.filter(n => n.isRead).length, icon: EnvelopeOpenIcon, color: 'success' }
          ].map((stat) => (
            <Col key={stat.label} md={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                  <div>
                    <p className="small text-secondary fw-medium mb-1">{stat.label}</p>
                    <h3 className={`fw-bold mb-0 text-${stat.color}`}>{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-4 bg-${stat.color} bg-opacity-10`}>
                    <stat.icon style={{ width: '1.5rem' }} className={`text-${stat.color}`} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters and Actions */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div className="d-flex align-items-center gap-2">
            <FunnelIcon style={{ width: '1.25rem' }} className="text-secondary" />
            <Form.Select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="w-auto border-0 bg-white shadow-sm rounded-3 fw-medium"
              style={{ minWidth: '180px' }}
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </Form.Select>
          </div>

          {selectedNotifications.length > 0 && (
            <Stack direction="horizontal" gap={2}>
              <Button 
                variant="light" 
                onClick={handleSelectAll}
                className="fw-bold px-3 rounded-3 shadow-sm border"
              >
                {selectedNotifications.length === filteredNotifications.filter(n => !n.isRead).length ? 'Deselect All' : 'Select All Unread'}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleMarkMultipleAsRead}
                className="fw-bold px-3 rounded-3 shadow-sm d-flex align-items-center gap-2"
              >
                <CheckIcon style={{ width: '1.1rem' }} /> Mark Read ({selectedNotifications.length})
              </Button>
            </Stack>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        {filteredNotifications.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-4 text-center py-5">
            <Card.Body>
              <InboxIcon style={{ width: '4rem' }} className="text-secondary opacity-25 mx-auto mb-3" />
              <h5 className="fw-bold text-dark">No notifications found</h5>
              <p className="text-secondary mb-0">
                {filter === 'unread' ? "Great! You've read all your notifications." : "You don't have any notifications yet."}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <Stack gap={3}>
            {filteredNotifications
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((notification) => (
              <Card 
                key={notification.id}
                className={`border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-shadow transition-all ${!notification.isRead ? 'bg-primary bg-opacity-5' : ''}`}
              >
                <div 
                  className="position-absolute h-100 top-0 start-0" 
                  style={{ width: '4px', background: !notification.isRead ? 'var(--bs-primary)' : 'var(--bs-gray-300)' }}
                ></div>
                <Card.Body className="p-4">
                  <Row className="align-items-start g-3">
                    <Col xs="auto">
                      <div className="h2 mb-0 opacity-75">{getNotificationIcon(notification.type)}</div>
                    </Col>
                    <Col className="min-w-0">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="fw-bold text-dark mb-0 truncate">{notification.title}</h6>
                        {!notification.isRead && <Badge pill bg="primary" style={{ fontSize: '0.6rem' }}>NEW</Badge>}
                      </div>
                      <p className="text-secondary small mb-3">{notification.message}</p>
                      
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                        <span className="small text-muted fw-medium d-flex align-items-center gap-1">
                          <CheckCircleIcon style={{ width: '0.85rem' }} /> {formatDate(notification.createdAt)}
                        </span>
                        
                        <div className="d-flex align-items-center gap-2">
                          {(notification.task || notification.taskId) && (
                            <Button 
                              variant="light" 
                              size="sm"
                              className="fw-bold px-3 rounded-3 border-0 bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-2"
                              onClick={() => handleViewDetails(notification)}
                            >
                              <ArrowTopRightOnSquareIcon style={{ width: '0.9rem' }} /> View
                            </Button>
                          )}
                          {!notification.isRead && (
                            <>
                              <Button 
                                variant="light" 
                                size="sm"
                                className="fw-bold px-3 rounded-3 border-0 bg-success bg-opacity-10 text-success d-flex align-items-center gap-2"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckIcon style={{ width: '0.9rem' }} /> Mark Read
                              </Button>
                              {filter === 'all' && (
                                <Form.Check 
                                  type="checkbox"
                                  className="ms-2 custom-check-lg shadow-none"
                                  checked={selectedNotifications.includes(notification.id)}
                                  onChange={() => handleSelectNotification(notification.id)}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Stack>
        )}

        <div className="mt-5">
          <Pagination 
            totalItems={filteredNotifications.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;