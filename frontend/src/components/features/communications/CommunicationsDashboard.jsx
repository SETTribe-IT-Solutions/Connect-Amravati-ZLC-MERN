import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MegaphoneIcon, 
  EnvelopeIcon, 
  CheckBadgeIcon, 
  PlusIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon,
  InboxIcon,
  PaperAirplaneIcon,
  MapPinIcon,
  ChevronRightIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  getAnnouncements, 
  getSentAnnouncements, 
  acknowledgeAnnouncement,
  getAnnouncementAcknowledgments,
  updateAnnouncement,
  deleteAnnouncement
} from '../../../services/communications/announcementService';
import AnnouncementForm from './AnnouncementForm';
import { toast } from 'react-hot-toast';
import Pagination from '../../common/Pagination';

import { Container, Row, Col, Card, Button, Form, Nav, Badge, Modal, Spinner } from 'react-bootstrap';

const CommunicationsDashboard = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [sentAnnouncements, setSentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isCollector = user?.role === 'COLLECTOR';
  const [activeTab, setActiveTab] = useState(isCollector ? 'sent' : 'inbox'); // inbox, sent, acknowledged
  const [filters, setFilters] = useState({
    date: '',
    month: '',
    year: ''
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [loadingAcks, setLoadingAcks] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', message: '', file: null, fileError: '' });
  const [updating, setUpdating] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [viewingAttachment, setViewingAttachment] = useState(null);

  // Reset pagination when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters]);

  const roleLevels = {
    'COLLECTOR': 1,
    'ADDITIONAL_DEPUTY_COLLECTOR': 2,
    'SDO': 3,
    'TEHSILDAR': 4
  };

  const isSeniorOfficial = user?.role && roleLevels[user.role] <= 4;

  const [inboxCount, setInboxCount] = useState(0);

  const fetchAnnouncements = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        userId: user?.userID,
        page: page - 1,
        size: itemsPerPage,
        sortBy: 'createdAt',
        direction: 'desc'
      };

      // Add filters if they exist
      if (filters.date) params.date = filters.date;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;

      if (activeTab === 'inbox') {
        const data = await getAnnouncements({ ...params, status: 'inbox' });
        setAnnouncements(data.content || []);
        setTotalItems(data.totalElements || 0);
        setInboxCount(data.totalElements || 0);
      } else if (activeTab === 'acknowledged') {
        const data = await getAnnouncements({ ...params, status: 'acknowledged' });
        setAnnouncements(data.content || []);
        setTotalItems(data.totalElements || 0);
        
        // Also fetch total inbox count (without filters for the badge)
        const inboxData = await getAnnouncements({ userId: user?.userID, status: 'inbox', page: 0, size: 1 });
        setInboxCount(inboxData.totalElements || 0);
      } else {
        const data = await getSentAnnouncements(params);
        setSentAnnouncements(data.content || []);
        setTotalItems(data.totalElements || 0);
        
        // Also fetch total inbox count (without filters for the badge)
        const inboxData = await getAnnouncements({ userId: user?.userID, status: 'inbox', page: 0, size: 1 });
        setInboxCount(inboxData.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userID) {
      fetchAnnouncements(currentPage);
    }
  }, [user?.userID, activeTab, currentPage, filters]);

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAnnouncement(id, user?.userID);
      toast.success("Message acknowledged");
      fetchAnnouncements(); // Refresh list
    } catch (_error) {
      toast.error("Failed to acknowledge");
    }
  };

  const fetchAcknowledgments = async (announcement) => {
    if (!announcement?.id) return;
    try {
      setSelectedAnnouncement(announcement);
      setLoadingAcks(true);
      const data = await getAnnouncementAcknowledgments(announcement.id);
      setAcknowledgments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching acknowledgments:", error);
      toast.error("Failed to load acknowledgments");
      setAcknowledgments([]);
    } finally {
      setLoadingAcks(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingAnnouncementId(id);
  };

  const executeDelete = async () => {
    if (!deletingAnnouncementId) return;
    setIsDeleting(true);
    try {
      await deleteAnnouncement(deletingAnnouncementId, user?.userID);
      toast.success("Message deleted successfully");
      fetchAnnouncements();
      setDeletingAnnouncementId(null);
    } catch (_error) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingAnnouncement(item);
    setEditForm({ title: item.title, message: item.message, file: null, fileError: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updateData = {
        title: editForm.title,
        message: editForm.message
      };
      await updateAnnouncement(editingAnnouncement.id, user?.userID, updateData, editForm.file);
      toast.success('Message updated successfully');
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (_error) {
      toast.error("Failed to update message");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ date: '', month: '', year: '' });
  };

  const handleDownload = async (filename) => {
    try {
      const downloadToast = toast.loading('Preparing download...');
      const response = await fetch(`http://localhost:8080/uploads/${filename}`);
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract clean filename: remove the UUID prefix if possible
      const cleanName = filename.split('-').slice(1).join('-') || filename;
      link.setAttribute('download', cleanName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started', { id: downloadToast });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Opening in new tab instead.");
      window.open(`http://localhost:8080/uploads/${filename}`, '_blank');
    }
  };

  const currentDisplayList = (activeTab === 'inbox' || activeTab === 'acknowledged') ? announcements : sentAnnouncements;

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = ['2024', '2025', '2026'];

  return (
    <div className="p-4 p-md-5">
      {/* Header */}
      <div className="mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 className="h3 fw-bold text-primary mb-1">
            Communications and Announcements
          </h1>
          <p className="text-secondary small mb-0 d-flex align-items-center gap-2">
            <span className="p-1 bg-primary rounded-circle" style={{ width: '4px', height: '4px' }}></span>
            Manage internal communications, messages, and alerts
          </p>
        </div>

        {isSeniorOfficial && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="rounded-3 px-4 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
          >
            <PlusIcon style={{ width: '1.25rem' }} />
            New Communication
          </Button>
        )}
      </div>

      {/* Tabs and Filters */}
      <div className="mb-4 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
        {/* Tabs */}
        <Nav variant="pills" className="bg-light p-1 rounded-3 gap-1 shadow-sm border-0" style={{ width: 'fit-content' }}>
          {!isCollector && (
            <>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'inbox'} 
                  onClick={() => setActiveTab('inbox')}
                  className={`rounded-3 py-2 px-4 fw-bold d-flex align-items-center gap-2 border-0 ${activeTab === 'inbox' ? '' : 'text-secondary'}`}
                >
                  <InboxIcon style={{ width: '1.1rem' }} />
                  Inbox
                  {inboxCount > 0 && (
                    <Badge bg={activeTab === 'inbox' ? 'light' : 'secondary'} text={activeTab === 'inbox' ? 'primary' : 'white'} className="ms-1">
                      {inboxCount}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'acknowledged'} 
                  onClick={() => setActiveTab('acknowledged')}
                  className={`rounded-3 py-2 px-4 fw-bold d-flex align-items-center gap-2 border-0 ${activeTab === 'acknowledged' ? '' : 'text-secondary'}`}
                >
                  <CheckBadgeIcon style={{ width: '1.1rem' }} />
                  History
                </Nav.Link>
              </Nav.Item>
            </>
          )}
          {isSeniorOfficial && (
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'sent'} 
                onClick={() => setActiveTab('sent')}
                className={`rounded-3 py-2 px-4 fw-bold d-flex align-items-center gap-2 border-0 ${activeTab === 'sent' ? '' : 'text-secondary'}`}
              >
                <PaperAirplaneIcon style={{ width: '1.1rem' }} />
                Sent Messages
              </Nav.Link>
            </Nav.Item>
          )}
        </Nav>

        {/* Filters */}
        <Card className="premium-card border-0 p-3 shadow-sm">
          <Row className="g-2 align-items-center">
            <Col xs="auto" className="d-flex align-items-center gap-2 text-primary fw-bold small px-2">
              <FunnelIcon style={{ width: '1.25rem' }} />
              Filter By:
            </Col>

            <Col md="auto">
              <div className="d-flex align-items-center gap-2 border-end pe-3 me-2">
                <Form.Control 
                  type="number" 
                  min="1" 
                  value={itemsPerPage} 
                  onChange={(e) => { 
                    const val = parseInt(e.target.value, 10); 
                    if (!isNaN(val) && val > 0) { setItemsPerPage(val); setCurrentPage(1); } 
                    else if (e.target.value === '') { setItemsPerPage(''); }
                  }} 
                  onBlur={() => { if (itemsPerPage === '' || itemsPerPage < 1) { setItemsPerPage(5); setCurrentPage(1); } }}
                  className="rounded-3 border-light-subtle small py-2 text-center" 
                  style={{ width: '70px' }}
                />
                <span className="small text-secondary fw-medium text-nowrap">per page</span>
              </div>
            </Col>
            
            <Col md="auto">
              <Form.Control 
                type="date" 
                name="date" 
                value={filters.date} 
                onChange={handleFilterChange} 
                className="rounded-3 border-light-subtle small py-2"
              />
            </Col>

            <Col md="auto">
              <Form.Select 
                name="month" 
                value={filters.month} 
                onChange={handleFilterChange} 
                className="rounded-3 border-light-subtle small py-2 cursor-pointer"
              >
                <option value="">All Months</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </Form.Select>
            </Col>

            <Col md="auto">
              <Form.Select 
                name="year" 
                value={filters.year} 
                onChange={handleFilterChange} 
                className="rounded-3 border-light-subtle small py-2 cursor-pointer"
                style={{ minWidth: '120px' }}
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </Form.Select>
            </Col>

            {(filters.date || filters.month || filters.year) && (
              <Col xs="auto">
                <Button 
                  variant="light" 
                  onClick={clearFilters} 
                  className="p-2 text-danger bg-danger bg-opacity-10 rounded-3 border-0"
                  title="Clear Filters"
                >
                  <XMarkIcon style={{ width: '1.25rem' }} />
                </Button>
              </Col>
            )}
          </Row>
        </Card>
      </div>

      {/* Content */}
      {loading ? (
        <Card className="premium-card border-0 p-5 text-center shadow-sm">
          <div className="d-flex flex-column align-items-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-secondary fw-medium mb-0">Fetching communications...</p>
          </div>
        </Card>
      ) : currentDisplayList.length === 0 ? (
        <Card className="premium-card border-0 p-5 text-center shadow-sm">
          <div className="d-flex flex-column align-items-center py-5 text-center">
            <div className="p-4 bg-primary bg-opacity-10 rounded-circle mb-4">
              <MegaphoneIcon style={{ width: '3rem' }} className="text-primary opacity-50" />
            </div>
            <h3 className="h5 fw-bold text-dark mb-2">No communications found</h3>
            <p className="text-secondary small mb-0" style={{ maxWidth: '400px' }}>
              Check your filters or try switching between Inbox and Sent messages.
            </p>
          </div>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-4">
          {currentDisplayList.map((item, index) => (
            <Card 
              key={`${activeTab}-${item.id}`}
              className="premium-card border-0 shadow-sm overflow-hidden hover-shadow-lg transition-all"
            >
              <div className="d-flex flex-column flex-md-row">
                <div 
                  className={`bg-${activeTab === 'inbox' ? 'primary' : 'info'}`} 
                  style={{ width: '4px' }} 
                />
                
                <Card.Body className="p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div className="d-flex align-items-center gap-2">

                      {(activeTab === 'inbox' || activeTab === 'acknowledged') && item.acknowledged && (
                        <Badge bg="success-subtle" text="success" className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill border border-success-subtle">
                          <CheckBadgeIcon style={{ width: '1rem' }} />
                          Acknowledged
                        </Badge>
                      )}
                      {activeTab === 'sent' && (
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <Button 
                            variant="light" 
                            size="sm" 
                            onClick={() => fetchAcknowledgments(item)}
                            className="d-flex align-items-center gap-1 px-3 py-1 bg-light text-primary rounded-pill border-0 shadow-sm small fw-bold"
                          >
                            <ShieldCheckIcon style={{ width: '1rem' }} />
                            {item.acknowledgmentCount} Acknowledgments
                            <ChevronRightIcon style={{ width: '0.75rem' }} />
                          </Button>
                          
                          <div className="d-flex align-items-center gap-1 px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-pill border border-primary border-opacity-10 small fw-bold shadow-sm">
                            <MapPinIcon style={{ width: '0.9rem' }} />
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                              Target: {item.targetRole} 
                              {item.targetTaluka && item.targetTaluka !== 'ALL TALUKAS' && ` | ${item.targetTaluka}`}
                              {item.targetVillage && item.targetVillage !== 'ALL VILLAGES' && ` › ${item.targetVillage}`}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="d-flex align-items-center gap-1 px-3 py-1 bg-light text-dark rounded-pill border border-light-subtle small fw-bold shadow-sm">
                        <UserIcon style={{ width: '0.9rem' }} className="text-primary" />
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          {activeTab === 'inbox' ? 'By' : 'Author'}: {item.creatorName} ({item.creatorRole})
                        </span>
                      </div>
                    </div>
                    <div className="text-secondary small d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center gap-1">
                        <ClockIcon style={{ width: '1rem' }} />
                        {formatTime(item.createdAt)}
                      </div>
                      <div className="d-flex align-items-center gap-1 border-start ps-3">
                        <DocumentTextIcon style={{ width: '1rem' }} />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                  </div>

                  <h3 className="h4 fw-bold text-dark mb-3">
                    {item.title}
                  </h3>
                  
                  <div className="text-secondary mb-4 lh-relaxed" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {item.message}
                  </div>



                  {item.attachment && (
                    <div className="mb-4 d-flex align-items-center justify-content-between p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-10 transition-all">
                      <div className="d-flex align-items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-white text-primary rounded-3 shadow-sm flex-shrink-0">
                          {['.jpg', '.jpeg', '.png', '.pdf'].some(ext => item.attachment.toLowerCase().endsWith(ext)) ? (
                            <EyeIcon style={{ width: '1.25rem' }} />
                          ) : (
                            <PaperClipIcon style={{ width: '1.25rem' }} />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="small fw-bold text-dark mb-0 text-truncate">
                            {item.attachment.split('-').slice(1).join('-') || 'Attachment'}
                          </p>
                          <p className="text-primary fw-medium mb-0" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                            Official Document
                          </p>
                        </div>
                      </div>
                      {['.jpg', '.jpeg', '.png'].some(ext => item.attachment.toLowerCase().endsWith(ext)) ? (
                        <Button
                          onClick={() => setViewingAttachment(item.attachment)}
                          className="btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 text-xs fw-bold shadow-sm"
                        >
                          <EyeIcon style={{ width: '1rem' }} />
                          View
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleDownload(item.attachment)}
                          className="btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 text-xs fw-bold shadow-sm"
                        >
                          <ArrowDownTrayIcon style={{ width: '1.1rem' }} />
                          Download
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-end gap-4 pt-4 border-top">
                    <div>
                      {activeTab === 'inbox' && (
                        !item.acknowledged ? (
                          <Button
                            onClick={() => handleAcknowledge(item.id)}
                            className="btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm d-flex align-items-center gap-2"
                          >
                            <ShieldCheckIcon style={{ width: '1.25rem' }} />
                            Acknowledge Receipt
                          </Button>
                        ) : (
                          <div className="text-success fw-bold d-flex align-items-center gap-2 px-3 py-2 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-10">
                            <CheckBadgeIcon style={{ width: '1.25rem' }} />
                            Acknowledged
                          </div>
                        )
                      )}

                      {activeTab === 'sent' && (
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant="light"
                            onClick={() => openEditModal(item)}
                            className="px-3 py-2 border border-light-subtle text-primary bg-white hover-bg-light rounded-3 fw-bold d-flex align-items-center gap-2 small shadow-sm"
                          >
                            <PencilSquareIcon style={{ width: '1.1rem' }} />
                            Edit
                          </Button>
                          <Button
                            variant="light"
                            onClick={() => confirmDelete(item.id)}
                            className="px-3 py-2 border border-light-subtle text-danger bg-white rounded-3 fw-bold d-flex align-items-center gap-2 small shadow-sm"
                          >
                            <TrashIcon style={{ width: '1.1rem' }} />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Card>
          ))}
          
          <div className="mt-4">
            <Pagination 
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* New Communication Modal */}
      <Modal show={isFormOpen} onHide={() => setIsFormOpen(false)} centered size="lg">
        <AnnouncementForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchAnnouncements();
          }}
          currentUser={user}
        />
      </Modal>

      {/* Edit Communication Modal */}
      <Modal show={!!editingAnnouncement} onHide={() => setEditingAnnouncement(null)} centered size="lg">
        <div className="modal-content border-0 overflow-hidden rounded-4">
          <Modal.Header className="bg-primary text-white border-0 p-4 d-flex align-items-center justify-content-between">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <PencilSquareIcon style={{ width: '1.5rem' }} />
              Edit Communication
            </Modal.Title>
            <Button variant="link" className="text-white p-0" onClick={() => setEditingAnnouncement(null)}><XMarkIcon style={{ width: '1.5rem' }} /></Button>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleUpdate}>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">Subject / Title</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="rounded-3 border-light-subtle py-2 shadow-sm"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">Content</Form.Label>
                <Form.Control
                  as="textarea"
                  required
                  rows={6}
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  className="rounded-3 border-light-subtle py-2 shadow-sm resize-none"
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="small fw-bold text-secondary d-flex align-items-center gap-2">
                  <PaperClipIcon style={{ width: '1.1rem' }} />
                  Update Attachment (Optional)
                </Form.Label>
                <div className="p-3 bg-light rounded-3 border border-dashed border-light-subtle">
                  <Form.Control
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const allowedExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.jpg', '.jpeg', '.png'];
                        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                        
                        if (!allowedExts.includes(ext)) {
                          setEditForm({ ...editForm, fileError: "Invalid file format", file: null });
                          e.target.value = null;
                          return;
                        }

                        if (file.size > 10 * 1024 * 1024) {
                          setEditForm({ ...editForm, fileError: "File size must be less than 10MB", file: null });
                          e.target.value = null;
                          return;
                        }
                        
                        setEditForm({ ...editForm, file: file, fileError: '' });
                      }
                    }}
                    className="bg-white border-0 shadow-none px-0"
                  />
                  {editingAnnouncement?.attachment && !editForm.file && !editForm.fileError && (
                    <div className="mt-2 d-flex align-items-center gap-2 text-primary small fw-medium">
                      <CheckBadgeIcon style={{ width: '0.9rem' }} />
                      Current: {editingAnnouncement.attachment.split('-').slice(1).join('-')}
                    </div>
                  )}
                  {editForm.fileError && (
                    <div className="mt-2 d-flex align-items-center gap-2 text-danger small fw-bold">
                      <XMarkIcon style={{ width: '1rem' }} />
                      {editForm.fileError}
                    </div>
                  )}
                </div>
                <Form.Text className="text-secondary small mt-2 d-block">
                  Allowed formats: PDF, DOC, Excel, Images, CSV, Text (Max 10MB)
                </Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end pt-3 border-top">
                <Button variant="primary" type="submit" disabled={updating} className="px-5 fw-bold rounded-3 shadow-sm d-flex align-items-center gap-2">
                  {updating ? <Spinner size="sm" /> : 'Save Changes'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </div>
      </Modal>

      {/* Acknowledgments Modal */}
      <Modal show={!!selectedAnnouncement} onHide={() => setSelectedAnnouncement(null)} centered size="lg">
        <div className="modal-content border-0 overflow-hidden rounded-4">
          <Modal.Header className="bg-primary text-white border-0 p-4 d-flex align-items-center justify-content-between">
            <div>
              <Modal.Title className="fw-bold mb-1">Acknowledgment List</Modal.Title>
              <p className="small mb-0 opacity-75 text-truncate" style={{ maxWidth: '400px' }}>
                "{selectedAnnouncement?.title}"
              </p>
            </div>
            <Button variant="link" className="text-white p-0" onClick={() => setSelectedAnnouncement(null)}><XMarkIcon style={{ width: '1.5rem' }} /></Button>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {loadingAcks ? (
              <div className="py-5 text-center">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-secondary small fw-medium">Loading acknowledgments...</p>
              </div>
            ) : (acknowledgments || []).length === 0 ? (
              <div className="py-5 text-center">
                <ShieldCheckIcon style={{ width: '3rem' }} className="text-secondary opacity-25 mb-3" />
                <p className="text-secondary fw-medium">No one has acknowledged this message yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {acknowledgments.map((ack, idx) => (
                  <Card key={idx} className="border-light-subtle shadow-sm rounded-3">
                    <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '2.5rem', height: '2.5rem' }}>
                          {ack.userName ? ack.userName.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="fw-bold text-dark mb-0 small text-uppercase">
                            {ack.userName || 'Unknown User'}
                          </p>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <Badge bg="primary-subtle" text="primary" className="text-uppercase" style={{ fontSize: '0.6rem' }}>
                              {ack.userRole || 'N/A'}
                            </Badge>
                            <span className="text-secondary" style={{ fontSize: '0.65rem' }}>
                              <MapPinIcon style={{ width: '0.8rem', verticalAlign: 'text-top' }} /> {ack.taluka || 'N/A'} | {ack.village || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="small fw-bold text-dark mb-0">{ack.acknowledgedAt ? formatDate(ack.acknowledgedAt) : 'N/A'}</p>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.65rem' }}>{ack.acknowledgedAt ? formatTime(ack.acknowledgedAt) : 'N/A'}</p>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light border-0 p-3">
            <Button variant="light" className="px-4 fw-bold rounded-3 border" onClick={() => setSelectedAnnouncement(null)}>Close</Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!deletingAnnouncementId} onHide={() => setDeletingAnnouncementId(null)} centered size="sm">
        <Modal.Body className="p-4 text-center">
          <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
            <TrashIcon style={{ width: '2rem', height: '2rem' }} className="text-danger" />
          </div>
          <h5 className="fw-bold mb-2">Delete Message?</h5>
          <p className="small text-secondary mb-4">
            This action will permanently remove the message for all recipients.
          </p>
          <div className="d-flex gap-2">
            <Button variant="light" className="flex-grow-1 small py-2 rounded-3 border fw-semibold" onClick={() => setDeletingAnnouncementId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" className="flex-grow-1 small py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={executeDelete} disabled={isDeleting}>
              {isDeleting ? <Spinner size="sm" /> : 'Delete'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Attachment Viewer Modal */}
      <Modal show={!!viewingAttachment} onHide={() => setViewingAttachment(null)} centered size="xl">
        <div className="modal-content border-0 overflow-hidden rounded-4 shadow-lg">
          <div className="bg-primary text-white p-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-3">
                <EyeIcon style={{ width: '1.5rem' }} className="text-white" />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-white">Attachment Viewer</h4>
                <p className="small mb-0 opacity-75">Preview official document</p>
              </div>
            </div>
            <Button variant="link" className="text-white p-0 border-0 shadow-none" onClick={() => setViewingAttachment(null)}>
              <XMarkIcon style={{ width: '1.5rem' }} />
            </Button>
          </div>
          <Modal.Body className="p-0 bg-dark" style={{ height: '75vh' }}>
            {viewingAttachment && (
              <div className="w-100 h-100 d-flex flex-column">
                <div className="flex-grow-1 bg-white overflow-auto d-flex align-items-center justify-content-center">
                  {viewingAttachment.toLowerCase().endsWith('.pdf') ? (
                    <iframe 
                      src={`http://localhost:8080/uploads/${viewingAttachment}#toolbar=0`} 
                      title="PDF Viewer"
                      className="w-100 h-100 border-0"
                    />
                  ) : (['.jpg', '.jpeg', '.png'].some(ext => viewingAttachment.toLowerCase().endsWith(ext))) ? (
                    <div className="p-4 d-flex align-items-center justify-content-center w-100 h-100">
                      <img 
                        src={`http://localhost:8080/uploads/${viewingAttachment}`} 
                        alt="Attachment Preview"
                        className="img-fluid rounded-3 shadow-sm"
                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-5">
                      <div className="p-4 bg-light rounded-circle d-inline-flex mb-4">
                        <PaperClipIcon style={{ width: '4rem' }} className="text-secondary opacity-25" />
                      </div>
                      <h4 className="text-dark fw-bold mb-2">Preview not available</h4>
                      <p className="text-secondary small mb-0">This file type cannot be previewed directly in the browser.</p>
                      <p className="text-secondary small">Please use the download button below.</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-light border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                   <div className="d-flex align-items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3 flex-shrink-0">
                        <DocumentTextIcon style={{ width: '1.25rem' }} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="small fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: '300px' }}>
                          {viewingAttachment.split('-').slice(1).join('-')}
                        </p>
                        <p className="text-primary fw-medium mb-0" style={{ fontSize: '0.65rem' }}>OFFICIAL ATTACHMENT</p>
                      </div>
                   </div>
                   <div className="d-flex w-100 w-md-auto">
                      <Button
                        onClick={() => handleDownload(viewingAttachment)}
                        className="btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-bold shadow-sm flex-grow-1 flex-md-grow-0"
                      >
                        <ArrowDownTrayIcon style={{ width: '1.1rem' }} />
                        Download Now
                      </Button>
                   </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

export default CommunicationsDashboard;
