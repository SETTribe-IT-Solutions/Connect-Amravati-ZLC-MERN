import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  ClipboardDocumentListIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  ChartBarIcon,
  PaperClipIcon,
  DocumentIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CalendarIcon,
  PlusCircleIcon,
  MapPinIcon,
  UsersIcon,
  TrashIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { 
  Container, Row, Col, Card, Button, Form, Table, Badge, 
  ProgressBar, Modal, Nav, Tab, Spinner, Stack, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { 
  getTasks, 
  createTask, 
  updateTaskStatus, 
  addTaskRemark, 
  updateTaskProgressAPI, 
  forwardTaskAPI 
} from '../../../services/tasks/taskService';
import { getSubordinates, getAllUsers } from '../../../services/users/userService';
import Pagination from '../../common/Pagination';
import { toast } from 'react-hot-toast';

const TaskDashboard = ({ user }) => {
  const role = user?.role || 'user';
  const roleLower = role.toLowerCase();
  const canCreateTask = ['collector', 'additional_deputy_collector', 'additional collector', 'sdo', 'tehsildar'].some(r => roleLower.includes(r));

  const [activeTab, setActiveTab] = useState(canCreateTask ? 'create' : 'tracking');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment] = useState('all');
  const [toast, setToast] = useState(null);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [pendingStatusFilter, setPendingStatusFilter] = useState('all');
  const [fileUploadError, setFileUploadError] = useState('');
  const fileInputRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  // Loading state managed silently
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const location = useLocation();

  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [subordinates, setSubordinates] = useState([]);
  const [forwardLoading, setForwardLoading] = useState(false);
  const [selectedTaskForForward, setSelectedTaskForForward] = useState(null);

  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [remarkTask, setRemarkTask] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateTaskObj, setUpdateTaskObj] = useState(null);
  const [updateAchievementValue, setUpdateAchievementValue] = useState('');

  const [newTask, setNewTask] = useState({
    title: '', description: '', department: '', priority: '',
    assignedType: 'role', assignedTo: '', dueDate: null, targetType: 'target',
    targetValue: '', location: '', attachments: [], selectedVillage: '', selectedRole: '', otherAssignedTo: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [pendingItemsPerPage, setPendingItemsPerPage] = useState(10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedDepartment]);

  useEffect(() => {
    setPendingCurrentPage(1);
  }, [pendingSearchTerm, pendingStatusFilter]);

  const showToast = (title, value) => {
    setToast({ title, value });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    try {
      const userID = user?.userID;
      if (userID) {
        const data = await getTasks(userID);
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const serverURL = baseURL.replace('/api', '');
        const mapped = (data || []).map(t => ({
          ...t,
          description: t.description || '',
          assignedTo: t.assignedToName || 'N/A',
          assignedBy: t.createdByName || 'Admin',
          status: t.status ? t.status.toString().toUpperCase() : 'PENDING',
          priority: t.priority ? t.priority.toString().toUpperCase() : 'MEDIUM',
          attachments: t.attachment ? [{ name: t.attachment, url: `${serverURL}/uploads/${t.attachment}` }] : [],
          remarks: t.remarks || []
        }));
        setTasks(mapped);
      }
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const requesterId = user?.userID;
      if (!requesterId) return;
      // Pass params as object and include a large size to get all relevant staff
      const data = await getAllUsers({ requesterId, size: 1000 });
      // Extract content array from the Page object
      const userList = data.content || data || [];
      // Filter out self
      const filteredStaff = userList.filter(u => u.userID?.toString() !== requesterId.toString());
      setStaff(filteredStaff);
    } catch (error) {
      console.error("Fetch Staff Error:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (canCreateTask) fetchStaff();
  }, [user]);

  useEffect(() => {
    const highlightId = new URLSearchParams(location.search).get('highlightId');
    if (highlightId && tasks.length > 0) {
      const targetTask = tasks.find(task => String(task.id) === highlightId);
      if (targetTask) {
        setSelectedTask(targetTask);
        setShowDetailsModal(true);
      }
    }

    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    const statusParam = new URLSearchParams(location.search).get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
      if (statusParam === 'PENDING' || statusParam === 'OVERDUE') {
        setPendingStatusFilter(statusParam);
        // Ensure pending tab gets activated if they clicked a pending/overdue
        if (tabParam === 'pending') {
          setActiveTab('pending');
        }
      }
    }
  }, [location.search, tasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const userID = user?.userID;
      const targetValue = newTask.targetType === 'target' ? parseInt(newTask.targetValue) : null;

      const baseTaskData = {
        title: newTask.title, description: newTask.description, department: newTask.department,
        priority: newTask.priority.toUpperCase(), requesterId: userID,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate.getTime() - newTask.dueDate.getTimezoneOffset() * 60000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        target: isNaN(targetValue) ? null : targetValue, location: newTask.location, progress: 0
      };

      if (newTask.assignedType === 'role') {
        const roleUsers = staff.filter(u => u.role === newTask.selectedRole);
        if (roleUsers.length === 0) {
          showToast(`No users found with role ${newTask.selectedRole.replace(/_/g, ' ')}`, 'error');
          return;
        }

        const promises = roleUsers.filter(u => u.userID.toString() !== userID.toString()).map(roleUser => {
          const taskData = { ...baseTaskData, assignedTo: roleUser.userID };
          const formData = new FormData();
          formData.append('task', new Blob([JSON.stringify(taskData)], { type: 'application/json' }));
          if (newTask.attachments?.[0]?.file) formData.append('file', newTask.attachments[0].file);
          return createTask(formData);
        });

        if (promises.length === 0) {
          showToast('Cannot assign tasks solely to yourself', 'error');
          return;
        }

        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        showToast(`Task assigned to ${successCount} user(s) successfully!`, 'success');
      } else {
        const assignedToId = newTask.assignedTo;
        if (!assignedToId) {
          showToast('Please select a recipient', 'error');
          return;
        }
        if (assignedToId.toString() === userID.toString()) {
          showToast('You cannot assign a task to yourself', 'error');
          return;
        }
        const taskData = { ...baseTaskData, assignedTo: assignedToId };
        const formData = new FormData();
        formData.append('task', new Blob([JSON.stringify(taskData)], { type: 'application/json' }));
        if (newTask.attachments?.[0]?.file) formData.append('file', newTask.attachments[0].file);
        await createTask(formData);
        showToast('Task created successfully!', 'success');
      }

      fetchTasks();
      setNewTask({ title: '', description: '', department: '', priority: '', assignedType: 'role', assignedTo: '', dueDate: null, targetType: 'target', targetValue: '', location: '', attachments: [], selectedVillage: '', selectedRole: '', otherAssignedTo: '' });
      setActiveTab('tracking');
    } catch (error) {
      console.error("Create Task Error:", error);
      const msg = error.response?.data?.message || error.message || 'Failed to create task';
      showToast(msg, 'error');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validExtensions = ['jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'txt'];
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const validFiles = [];
    let errorMsg = '';

    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        errorMsg = 'Invalid file type. Only IMG, PNG, DOCS, EXCEL, PDF, and TXT are allowed.';
      } else if (file.size > MAX_SIZE) {
        errorMsg = 'File size exceeds 50MB limit.';
      } else {
        validFiles.push(file);
      }
    });

    if (errorMsg) {
      showToast(errorMsg, 'error');
      setFileUploadError(errorMsg);
    } else {
      setFileUploadError('');
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newAttachments = validFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(1) + ' KB',
      file: file
    }));
    setNewTask({ ...newTask, attachments: [...newTask.attachments, ...newAttachments] });
    showToast(`${validFiles.length} file(s) attached successfully!`, 'success');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index) => {
    const updatedAttachments = newTask.attachments.filter((_, i) => i !== index);
    setNewTask({ ...newTask, attachments: updatedAttachments });
    showToast('Attachment removed', 'info');
  };

  const handleAddRemark = async (taskId, text) => {
    if (!text?.trim()) return showToast('Please enter a remark', 'error');
    try {
      const userID = user?.userID;
      await addTaskRemark(taskId, text, userID);
      await fetchTasks();
      showToast('Remark added successfully!', 'success');
      setIsRemarkModalOpen(false);
      setRemarkText('');
    } catch (_error) {
      showToast('Failed to add remark', 'error');
    }
  };

  const handleOpenForwardModal = async (task) => {
    try {
      const userID = user?.userID;
      setForwardLoading(true);
      const data = await getSubordinates(userID);
      // Filter out self
      const filteredSubordinates = (data || []).filter(sub => sub.userID.toString() !== userID.toString());
      setSubordinates(filteredSubordinates);
      setSelectedTaskForForward(task);
      setIsForwardModalOpen(true);
    } catch (_error) {
      showToast('Failed to fetch subordinates', 'error');
    } finally {
      setForwardLoading(false);
    }
  };

  const handleConfirmForward = async (targetUserId) => {
    try {
      const userID = user?.userID;

      if (targetUserId === userID) {
        showToast('You cannot forward a task to yourself', 'error');
        return;
      }

      await forwardTaskAPI(selectedTaskForForward.id, targetUserId, userID);
      setIsForwardModalOpen(false);
      fetchTasks();
      showToast('Task forwarded successfully!', 'success');
    } catch (_error) {
      showToast('Failed to forward task', 'error');
    }
  };

  const handleUpdateProgress = async (taskId, achieved) => {
    try {
      const userID = user?.userID;
      await updateTaskProgressAPI(taskId, parseInt(achieved), userID);
      fetchTasks();
      showToast(`Achievement updated to ${achieved}`, 'success');
      setIsUpdateModalOpen(false);
    } catch (_error) {
      showToast('Failed to update progress', 'error');
    }
  };

  const tabs = canCreateTask
    ? [{ id: 'create', name: 'Create Task', icon: PlusCircleIcon },
    { id: 'tracking', name: 'Task Tracking', icon: ArrowPathIcon },
    { id: 'pending', name: 'Pending & Overdue', icon: ClockIcon }]
    : [{ id: 'tracking', name: 'Task Tracking', icon: ArrowPathIcon },
    { id: 'pending', name: 'Pending & Overdue', icon: ClockIcon }];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' ||
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedToRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedToRole?.replace(/_/g, ' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.createdByRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.createdByRole?.replace(/_/g, ' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(task.dueDate).toLocaleDateString('en-GB').includes(searchTerm) ||
      (task.progress || 0).toString().includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus.replace(/\s+/g, '_').toUpperCase();
    const matchesDept = selectedDepartment === 'all' || task.department === selectedDepartment;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const filteredPendingTasks = tasks.filter(t => {
    const isPending = t.status === 'PENDING' || t.status === 'OVERDUE';
    const matchesSearch = pendingSearchTerm === '' ||
      t.title?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.assignedTo?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.assignedToRole?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.assignedToRole?.replace(/_/g, ' ').toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.assignedBy?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.createdByRole?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.createdByRole?.replace(/_/g, ' ').toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.priority?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.status?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      new Date(t.dueDate).toLocaleDateString('en-GB').includes(pendingSearchTerm) ||
      (t.progress || 0).toString().includes(pendingSearchTerm);
    const matchesStatus = pendingStatusFilter === 'all' || t.status === pendingStatusFilter.toUpperCase();
    return isPending && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const s = status?.toUpperCase() || '';
    if (s === 'COMPLETED') return 'success';
    if (s === 'IN_PROGRESS') return 'secondary';
    if (s === 'PENDING') return 'orange';
    if (s === 'OVERDUE') return 'danger';
    return 'secondary';
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase() || '';
    if (p === 'HIGH') return 'danger';
    if (p === 'MEDIUM') return 'warning';
    if (p === 'LOW') return 'success';
    return 'secondary';
  };


  const stats = [
    { name: 'Total Tasks', value: tasks.length, icon: DocumentTextIcon, bgColor: '#eff6ff', textColor: '#000000' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length, icon: CheckCircleIcon, bgColor: '#f0fdf4', textColor: '#16a34a' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: ArrowPathIcon, bgColor: '#f8fafc', textColor: '#64748b' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length, icon: ClockIcon, bgColor: '#fff7ed', textColor: '#f97316' },
    { name: 'Overdue', value: tasks.filter(t => t.status === 'OVERDUE').length, icon: ExclamationTriangleIcon, bgColor: '#fef2f2', textColor: '#dc2626' }
  ];

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-4 shadow-lg border-0 d-flex align-items-center gap-3 text-white" 
            style={{ zIndex: 9999, backgroundColor: '#2563eb', minWidth: '240px' }}>
            <DocumentTextIcon style={{ width: '1.25rem', height: '1.25rem', opacity: 0.8 }} />
            <div className="flex-grow-1">
              <p className="small mb-0 opacity-80">{toast.title}</p>
              <p className="h5 fw-bold mb-0">{toast.value}</p>
            </div>
            <XMarkIcon className="cursor-pointer" style={{ width: '1rem', height: '1rem' }} onClick={() => setToast(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="h2 fw-bold" style={{ 
            background: 'linear-gradient(90deg, #2563eb, #1e40af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Task Management</h1>
          <p className="text-secondary small">Create, track and manage all your tasks in one place</p>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          {stats.map((stat) => (
            <Col key={stat.name} xs={6} md={true}>
              <Card 
                className="premium-card p-3 h-100 border-0 shadow-sm shadow-hover" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                   if (stat.name === 'Total Tasks') {
                     setSelectedStatus('all');
                   } else if (stat.name === 'Completed') {
                     setSelectedStatus('COMPLETED');
                   } else if (stat.name === 'In Progress') {
                     setSelectedStatus('IN_PROGRESS');
                   } else if (stat.name === 'Pending') {
                     setSelectedStatus('PENDING');
                   } else if (stat.name === 'Overdue') {
                     setSelectedStatus('OVERDUE');
                   }
                   setActiveTab('tracking');
                   showToast(stat.name, stat.value);
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="small text-secondary mb-1">{stat.name}</p>
                    <p className="h3 fw-bold mb-0">{stat.value}</p>
                  </div>
                  <div className="rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: stat.bgColor }}>
                    <stat.icon style={{ width: '1.25rem', height: '1.25rem', color: stat.textColor }} />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tab Navigation */}
        <div className="bg-white rounded-4 shadow-sm p-1 mb-4 d-inline-flex gap-1 border">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`btn px-4 py-2 rounded-3 text-sm fw-bold border-0 transition-all ${
                activeTab === tab.id ? 'btn-primary shadow-sm' : 'btn-light text-secondary bg-transparent'
              }`}
            >
              <tab.icon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              {tab.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Create Task Tab */}
          {activeTab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Card className="premium-card border-0 overflow-hidden">
                <div className="p-4" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}>
                  <h5 className="mb-0 fw-bold text-white">Create New Task</h5>
                </div>
                <div className="p-4">
                  <Form onSubmit={handleCreateTask}>
                    <Row className="g-3 mb-4">
                      <Form.Group as={Col} md={6}>
                        <Form.Label className="small fw-bold text-secondary">Task Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
                          placeholder="Enter task title" className="rounded-3 border-light-subtle" required />
                      </Form.Group>
                      <Form.Group as={Col} md={6}>
                        <Form.Label className="small fw-bold text-secondary">Department <span className="text-danger">*</span></Form.Label>
                        <Form.Select value={newTask.department} onChange={(e) => setNewTask({ ...newTask, department: e.target.value })} 
                          className="rounded-3 border-light-subtle" required>
                          <option value="">Select Department</option>
                          <option value="Revenue">Revenue</option>
                          <option value="Finance">Finance</option>
                          <option value="Administration">Administration</option>
                          <option value="Development">Development</option>
                          <option value="Infrastructure">Infrastructure</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group as={Col} md={6}>
                        <Form.Label className="small fw-bold text-secondary">Priority <span className="text-danger">*</span></Form.Label>
                        <Form.Select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} 
                          className="rounded-3 border-light-subtle" required>
                          <option value="">Select Priority</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group as={Col} md={6}>
                        <Form.Label className="small fw-bold text-secondary">Due Date <span className="text-danger">*</span></Form.Label>
                        <div>
                          <DatePicker selected={newTask.dueDate} onChange={(date) => setNewTask({ ...newTask, dueDate: date })} 
                            dateFormat="dd/MM/yyyy" className="form-control rounded-3 border-light-subtle" placeholderText="Select due date" 
                            minDate={new Date()} required />
                        </div>
                      </Form.Group>
                      <Form.Group as={Col} xs={12}>
                        <Form.Label className="small fw-bold text-secondary">Location</Form.Label>
                        <div className="position-relative">
                          <MapPinIcon className="position-absolute translate-middle-y text-secondary" style={{ width: '1.25rem', left: '0.75rem', top: '50%', zIndex: 10 }} />
                          <Form.Control type="text" value={newTask.location} onChange={(e) => setNewTask({ ...newTask, location: e.target.value })} 
                            className="rounded-3 border-light-subtle ps-5" placeholder="Enter location" />
                        </div>
                      </Form.Group>
                    </Row>

                    {/* Allocate To Section */}
                    <div className="mb-4 border-top pt-4">
                      <Form.Label className="small fw-bold text-secondary mb-3 d-block">Allocate To <span className="text-danger">*</span></Form.Label>
                      <div className="d-flex flex-wrap gap-4 mb-3">
                        {['role', 'employee', 'village', 'other'].map((type) => (
                          <Form.Check key={type} type="radio" label={type === 'other' ? 'Other' : type.charAt(0).toUpperCase() + type.slice(1)} 
                            name="assignedType" value={type} checked={newTask.assignedType === type} 
                            onChange={(e) => setNewTask({ ...newTask, assignedType: e.target.value, assignedTo: '' })}
                            id={`at-${type}`} className="text-secondary small fw-medium" />
                        ))}
                      </div>

                      {newTask.assignedType === 'role' && (() => {
                        const roleRanks = { 'collector': 1, 'additional_deputy_collector': 2, 'sdo': 3, 'tehsildar': 4, 'bdo': 5, 'talathi': 6, 'gramsevak': 7, 'gram_sevak': 7 };
                        const userRank = roleLower.includes('admin') ? 0 : (roleRanks[roleLower] || 99);
                        const allowedRoles = [...new Set(staff.map(u => u.role).filter(r => r && r !== 'SYSTEM_ADMINISTRATOR'))]
                          .filter(r => (roleRanks[r.toLowerCase()] || 99) > userRank);

                        return (
                          <div className="vstack gap-2">
                            <Form.Select value={newTask.selectedRole || ''} onChange={(e) => setNewTask({ ...newTask, selectedRole: e.target.value, assignedTo: '' })} 
                              className="rounded-3 border-light-subtle" required>
                              <option value="">Select Role</option>
                              {allowedRoles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                            </Form.Select>
                            {newTask.selectedRole && (
                              <div className="p-3 rounded-3 d-flex align-items-center gap-3 border" style={{ backgroundColor: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}>
                                <UsersIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                                <span className="small">This task will be automatically assigned to <strong>all {staff.filter(u => u.role === newTask.selectedRole).length}</strong> users with role <strong>{newTask.selectedRole.replace(/_/g, ' ')}</strong>.</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {newTask.assignedType === 'employee' && (() => {
                        const roleRanks = { 'collector': 1, 'additional_deputy_collector': 2, 'sdo': 3, 'tehsildar': 4, 'bdo': 5, 'talathi': 6, 'gramsevak': 7, 'gram_sevak': 7 };
                        const userRank = roleLower.includes('admin') ? 0 : (roleRanks[roleLower] || 99);
                        const allowedRoles = [...new Set(staff.map(u => u.role).filter(r => r && r !== 'SYSTEM_ADMINISTRATOR'))]
                          .filter(r => (roleRanks[r.toLowerCase()] || 99) > userRank);

                        return (
                          <div className="vstack gap-2">
                            <Form.Select value={newTask.selectedRole || ''} onChange={(e) => setNewTask({ ...newTask, selectedRole: e.target.value, assignedTo: '' })} 
                              className="rounded-3 border-light-subtle" required>
                              <option value="">Select Role</option>
                              {allowedRoles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                            </Form.Select>
                            {newTask.selectedRole && (
                              <Form.Select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} 
                                className="rounded-3 border-light-subtle" required>
                                <option value="">Select Specific Officer</option>
                                {staff.filter(u => u.role === newTask.selectedRole).map(u => (
                                  <option key={u.userID} value={u.userID}>{u.name}</option>
                                ))}
                              </Form.Select>
                            )}
                          </div>
                        );
                      })()}

                      {newTask.assignedType === 'village' && (
                        <div className="vstack gap-2">
                          <Form.Select value={newTask.selectedVillage} onChange={(e) => setNewTask({ ...newTask, selectedVillage: e.target.value, assignedTo: '' })} 
                            className="rounded-3 border-light-subtle" required>
                            <option value="">Select Village</option>
                            {[...new Set(staff.map(u => u.village).filter(Boolean))].map(v => <option key={v} value={v}>{v}</option>)}
                          </Form.Select>
                          {newTask.selectedVillage && (
                            <Form.Select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} 
                              className="rounded-3 border-light-subtle" required>
                              <option value="">Select Officer in {newTask.selectedVillage}</option>
                              {staff.filter(u => u.village === newTask.selectedVillage).map(u => (
                                <option key={u.userID} value={u.userID}>{u.name} - {u.role?.replace(/_/g, ' ')}</option>
                              ))}
                            </Form.Select>
                          )}
                        </div>
                      )}

                      {newTask.assignedType === 'other' && (
                        <Form.Control type="text" value={newTask.otherAssignedTo} onChange={(e) => {
                          const val = e.target.value;
                          const found = staff.find(u => u.name.toLowerCase() === val.toLowerCase());
                          setNewTask({ ...newTask, otherAssignedTo: val, assignedTo: found ? found.userID : val });
                        }} className="rounded-3 border-light-subtle" placeholder="Enter name or ID manually..." required />
                      )}
                    </div>

                    {/* Target Section */}
                    <div className="mb-4 border-top pt-4">
                      <Form.Label className="small fw-bold text-secondary mb-3 d-block">Target <span className="text-danger">*</span></Form.Label>
                      <div className="d-flex gap-4 mb-3">
                        <Form.Check type="radio" label="Specific Target" name="targetType" value="target" checked={newTask.targetType === 'target'} 
                          onChange={(e) => setNewTask({ ...newTask, targetType: e.target.value })} id="tt-target" className="text-secondary small fw-medium" />
                        <Form.Check type="radio" label="Not Applicable (NA)" name="targetType" value="na" checked={newTask.targetType === 'na'} 
                          onChange={(e) => setNewTask({ ...newTask, targetType: e.target.value, targetValue: 'NA' })} id="tt-na" className="text-secondary small fw-medium" />
                      </div>
                      {newTask.targetType === 'target' ? (
                        <Form.Control type="text" value={newTask.targetValue} onChange={(e) => setNewTask({ ...newTask, targetValue: e.target.value })} 
                          className="rounded-3 border-light-subtle" placeholder="Enter target value (e.g. 100)" required />
                      ) : (
                        <div className="p-3 rounded-3 bg-light border text-muted small italic">Target set to NA</div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4 border-top pt-4">
                      <Form.Label className="small fw-bold text-secondary">Description <span className="text-danger">*</span></Form.Label>
                      <Form.Control as="textarea" rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} 
                        className="rounded-3 border-light-subtle" placeholder="Enter task description" required />
                    </div>

                    {/* Attachments */}
                    <div className="mb-4">
                      <Form.Label className="small fw-bold text-secondary">Attachments</Form.Label>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept=".jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.pdf,.txt" className="d-none" />
                      <div onClick={() => fileInputRef.current?.click()} 
                        className={`w-100 p-4 border border-2 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center cursor-pointer bg-light-hover transition-all gap-2 ${fileUploadError ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                        style={{ borderColor: fileUploadError ? '#dc3545' : '#e2e8f0' }}>
                        <PaperClipIcon style={{ width: '1.5rem', height: '1.5rem' }} className={`${fileUploadError ? 'text-danger' : 'text-secondary'} mb-1`} />
                        <span className={`small fw-bold ${fileUploadError ? 'text-danger' : 'text-secondary'}`}>Click or Drag files to upload</span>
                        <div className="d-flex flex-column align-items-center small text-muted opacity-75" style={{ fontSize: '0.7rem' }}>
                          <span>Accepted: Image, PDF, Docs, Excel, Txt</span>
                          <span>Max Size: 50MB per file</span>
                        </div>
                      </div>
                      {fileUploadError && (
                        <p className="text-danger small mt-2 mb-0 fw-bold d-flex align-items-center gap-1">
                          <ExclamationTriangleIcon style={{ width: '1rem' }} />
                          {fileUploadError}
                        </p>
                      )}
                      {newTask.attachments.length > 0 && (
                        <div className="mt-3 vstack gap-2">
                          {newTask.attachments.map((file, index) => (
                            <div key={index} className="d-flex align-items-center justify-content-between p-2 bg-light rounded-3 border">
                              <div className="d-flex align-items-center gap-2 overflow-hidden">
                                <PaperClipIcon style={{ width: '1rem', height: '1rem' }} className="text-secondary flex-shrink-0" />
                                <span className="small text-dark text-truncate">{file.name}</span>
                                <span className="text-muted" style={{ fontSize: '0.7rem' }}>({file.size})</span>
                              </div>
                              <Button variant="link" onClick={() => handleRemoveAttachment(index)} className="p-1 text-danger">
                                <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4">
                      <Button variant="light" className="px-4 fw-bold rounded-3 text-secondary" onClick={() => setActiveTab('tracking')}>Cancel</Button>
                      <Button type="submit" variant="primary" className="px-4 fw-bold rounded-3 shadow-sm">Create Task</Button>
                    </div>
                  </Form>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Task Tracking Tab */}
          {activeTab === 'tracking' && (
            <motion.div key="tracking" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Card className="premium-card border-0 p-4">
                <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control 
                      type="number" 
                      min="1" 
                      value={itemsPerPage} 
                      onChange={(e) => { 
                        const val = parseInt(e.target.value, 10); 
                        if (!isNaN(val) && val > 0) { setItemsPerPage(val); setCurrentPage(1); } 
                        else if (e.target.value === '') { setItemsPerPage(''); }
                      }} 
                      onBlur={() => { if (itemsPerPage === '' || itemsPerPage < 1) { setItemsPerPage(10); setCurrentPage(1); } }}
                      className="rounded-3 border-light-subtle py-2 text-center" 
                      style={{ width: '80px' }}
                    />
                    <span className="small text-secondary fw-medium text-nowrap">per page</span>
                  </div>
                  <div className="flex-grow-1 position-relative" style={{ minWidth: '200px' }}>
                    <MagnifyingGlassIcon className="position-absolute translate-middle-y text-secondary" style={{ width: '1rem', left: '0.75rem', top: '50%', zIndex: 10 }} />
                    <Form.Control type="text" placeholder="Search tasks..." className="rounded-3 border-light-subtle ps-5 py-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Form.Select className="rounded-3 border-light-subtle w-auto text-dark" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="OVERDUE">Overdue</option>
                  </Form.Select>
                  <Button variant="light" className="rounded-3 fw-bold text-secondary border" onClick={() => { setSearchTerm(''); setSelectedStatus('all'); }}>Reset</Button>
                </div>

                <div className="table-responsive">
                  <Table borderless hover className="align-middle mb-0 custom-table">
                    <thead className="bg-light border-bottom">
                      <tr className="text-secondary small fw-bold text-uppercase">
                        <th className="py-3 px-3">Task</th>
                        <th className="py-3">Priority</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Assigned To</th>
                        <th className="py-3">Assigned By</th>
                        <th className="py-3">Due Date</th>
                        <th className="py-3 text-center">Progress</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length > 0 ? filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((task) => (
                        <tr key={task.id} className="border-bottom-ghost">
                          <td className="px-3">
                            <span className="fw-bold d-block text-dark small">{task.title}</span>
                          </td>
                          <td>
                            <Badge bg={getPriorityColor(task.priority)} className="rounded-pill px-2 py-1 uppercase" style={{ fontSize: '0.65rem' }}>{task.priority}</Badge>
                          </td>
                          <td>
                            <Badge bg={getStatusColor(task.status) === 'orange' ? '' : getStatusColor(task.status)} className={`rounded-pill px-2 py-1 uppercase ${getStatusColor(task.status) === 'orange' ? 'bg-orange' : ''}`} style={{ fontSize: '0.65rem' }}>{task.status}</Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="small fw-medium text-dark">{task.assignedTo}</span>
                              {task.assignedToRole && <span className="text-muted" style={{ fontSize: '0.65rem' }}>{task.assignedToRole.replace(/_/g, ' ')}</span>}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="small fw-medium text-dark">{task.assignedBy}</span>
                              {task.createdByRole && <span className="text-muted" style={{ fontSize: '0.65rem' }}>{task.createdByRole.replace(/_/g, ' ')}</span>}
                            </div>
                          </td>
                          <td>
                            <span className="small text-secondary">{new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                          </td>
                          <td>
                            <div className="text-center">
                              <div className="small fw-bold text-primary">{task.progress || 0}%</div>
                              <ProgressBar now={task.progress || 0} style={{ height: '4px', marginTop: '4px' }} className="rounded-pill" />
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-3">
                              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${task.id}`}>View Task Details</Tooltip>}>
                                <Button variant="light" size="sm" onClick={() => { setSelectedTask(task); setShowDetailsModal(true); }} className="p-1 border-0 bg-transparent d-flex flex-column align-items-center">
                                  <EyeIcon style={{ width: '1.1rem', height: '1.1rem' }} className="text-primary mb-1" />
                                  <span className="fw-bold text-dark" style={{ fontSize: '0.6rem' }}>View</span>
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-remark-${task.id}`}>Add Remark</Tooltip>}>
                                <Button variant="light" size="sm" onClick={() => { setRemarkTask(task); setRemarkText(''); setIsRemarkModalOpen(true); }} className="p-1 border-0 bg-transparent d-flex flex-column align-items-center">
                                  <ChatBubbleLeftRightIcon style={{ width: '1.1rem', height: '1.1rem' }} className="text-success mb-1" />
                                  <span className="fw-bold text-dark" style={{ fontSize: '0.6rem' }}>Remark</span>
                                </Button>
                              </OverlayTrigger>
                              
                              {/* Forward Task Button - Visible if assigned to user or created by user, AND user is not a Gram Sevak */}
                              {((task.assignedToId?.toString() === user?.userID?.toString()) || (task.createdById?.toString() === user?.userID?.toString())) && 
                               !roleLower.includes('gramsevak') && !roleLower.includes('gram_sevak') && (
                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-forward-${task.id}`}>Forward Task</Tooltip>}>
                                  <Button variant="light" size="sm" onClick={() => handleOpenForwardModal(task)} className="p-1 border-0 bg-transparent d-flex flex-column align-items-center">
                                    <PaperAirplaneIcon style={{ width: '1.1rem', height: '1.1rem' }} className="text-info mb-1" />
                                    <span className="fw-bold text-dark" style={{ fontSize: '0.6rem' }}>Forward</span>
                                  </Button>
                                </OverlayTrigger>
                              )}

                              {/* Update Progress Button - Visible if assigned to user or created by user */}
                              {((task.assignedToId?.toString() === user?.userID?.toString()) || (task.createdById?.toString() === user?.userID?.toString())) && (
                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-progress-${task.id}`}>Update Progress</Tooltip>}>
                                  <Button variant="light" size="sm" onClick={() => { setUpdateTaskObj(task); setUpdateAchievementValue(task.achievement || 0); setIsUpdateModalOpen(true); }} className="p-1 border-0 bg-transparent d-flex flex-column align-items-center">
                                    <ArrowPathIcon style={{ width: '1.1rem', height: '1.1rem' }} className="text-warning mb-1" />
                                    <span className="fw-bold text-dark" style={{ fontSize: '0.6rem' }}>Update</span>
                                  </Button>
                                </OverlayTrigger>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={8} className="text-center py-5 text-muted small italic">No tasks found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-4">
                  <Pagination 
                    totalItems={filteredTasks.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Pending Report Tab */}
          {activeTab === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Card className="premium-card border-0 p-4">
                <Row className="g-3 mb-4">
                  <Col>
                    <div onClick={() => setPendingStatusFilter('PENDING')} 
                      className={`p-3 rounded-4 cursor-pointer text-center transition-all border-0 shadow-sm ${pendingStatusFilter === 'PENDING' ? 'bg-orange text-white scale-102' : 'bg-light text-orange'}`}
                      style={{ border: pendingStatusFilter === 'PENDING' ? 'none' : '1px solid #ffedd5' }}>
                      <p className="small mb-1 fw-bold">Pending</p>
                      <p className="h3 fw-bold mb-0">{tasks.filter(t => t.status === 'PENDING').length}</p>
                    </div>
                  </Col>
                  <Col>
                    <div onClick={() => setPendingStatusFilter('OVERDUE')} 
                      className={`p-3 rounded-4 cursor-pointer text-center transition-all border-0 shadow-sm ${pendingStatusFilter === 'OVERDUE' ? 'bg-danger text-white scale-102' : 'bg-light text-danger'}`}
                      style={{ border: pendingStatusFilter === 'OVERDUE' ? 'none' : '1px solid #fee2e2' }}>
                      <p className="small mb-1 fw-bold">Overdue</p>
                      <p className="h3 fw-bold mb-0">{tasks.filter(t => t.status === 'OVERDUE').length}</p>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control 
                      type="number" 
                      min="1" 
                      value={pendingItemsPerPage} 
                      onChange={(e) => { 
                        const val = parseInt(e.target.value, 10); 
                        if (!isNaN(val) && val > 0) { setPendingItemsPerPage(val); setPendingCurrentPage(1); } 
                        else if (e.target.value === '') { setPendingItemsPerPage(''); }
                      }} 
                      onBlur={() => { if (pendingItemsPerPage === '' || pendingItemsPerPage < 1) { setPendingItemsPerPage(10); setPendingCurrentPage(1); } }}
                      className="rounded-3 border-light-subtle py-2 text-center" 
                      style={{ width: '80px' }}
                    />
                    <span className="small text-secondary fw-medium text-nowrap">per page</span>
                  </div>
                  <div className="flex-grow-1 position-relative">
                    <MagnifyingGlassIcon className="position-absolute translate-middle-y text-secondary" style={{ width: '1rem', left: '0.75rem', top: '50%', zIndex: 10 }} />
                    <Form.Control type="text" placeholder="Search pending tasks..." className="rounded-3 border-light-subtle ps-5 py-2" value={pendingSearchTerm} onChange={(e) => setPendingSearchTerm(e.target.value)} />
                  </div>
                  <Form.Select className="rounded-3 border-light-subtle w-auto" value={pendingStatusFilter} onChange={(e) => setPendingStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                  </Form.Select>
                </div>

                <div className="table-responsive">
                  <Table borderless hover className="align-middle mb-0 custom-table">
                    <thead className="bg-light border-bottom">
                      <tr className="text-secondary small fw-bold text-uppercase">
                        <th className="py-3 px-3">Task</th>
                        <th className="py-3">Priority</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Assigned To</th>
                        <th className="py-3">Due Date</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPendingTasks.length > 0 ? filteredPendingTasks.slice((pendingCurrentPage - 1) * pendingItemsPerPage, pendingCurrentPage * pendingItemsPerPage).map((task) => (
                        <tr key={task.id} className="border-bottom-ghost">
                          <td className="px-3">
                            <span className="fw-bold d-block text-dark small">{task.title}</span>
                          </td>
                          <td>
                            <Badge bg={getPriorityColor(task.priority)} className="rounded-pill px-2 py-1 uppercase" style={{ fontSize: '0.65rem' }}>{task.priority}</Badge>
                          </td>
                          <td>
                            <Badge bg={getStatusColor(task.status) === 'orange' ? '' : getStatusColor(task.status)} className={`rounded-pill px-2 py-1 uppercase ${getStatusColor(task.status) === 'orange' ? 'bg-orange' : ''}`} style={{ fontSize: '0.65rem' }}>{task.status}</Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="small fw-medium text-dark">{task.assignedTo}</span>
                              {task.assignedToRole && <span className="text-muted" style={{ fontSize: '0.65rem' }}>{task.assignedToRole.replace(/_/g, ' ')}</span>}
                            </div>
                          </td>
                          <td>
                            <span className="small text-secondary">{new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center">
                              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-pending-view-${task.id}`}>View Task Details</Tooltip>}>
                                <Button variant="light" size="sm" onClick={() => { setSelectedTask(task); setShowDetailsModal(true); }} className="rounded-pill p-1 border-0 bg-transparent">
                                  <EyeIcon style={{ width: '1rem', height: '1rem' }} className="text-primary" />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="text-center py-5 text-muted small italic">No pending tasks found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-4">
                  <Pagination 
                    totalItems={filteredPendingTasks.length}
                    itemsPerPage={pendingItemsPerPage}
                    currentPage={pendingCurrentPage}
                    onPageChange={setPendingCurrentPage}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="md">
        {selectedTask && (
          <div className="modal-content border-0 overflow-hidden rounded-4">
            <Modal.Header className="border-0 p-4 pb-0 d-flex flex-column align-items-start position-relative overflow-hidden" 
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #312e81 100%)' }}>
              <div className="d-flex justify-content-between w-100 mb-2">
                <h5 className="modal-title fw-bold text-white">Task Details</h5>
                <Button variant="link" className="text-white p-0 border-0 shadow-none" onClick={() => setShowDetailsModal(false)}><XMarkIcon style={{ width: '1.5rem', height: '1.5rem' }} /></Button>
              </div>
              <div className="d-flex flex-wrap gap-3 mb-3">
                <div className="small text-white-50 d-flex align-items-center gap-1">
                  <UserIcon style={{ width: '0.875rem' }} /> 
                  Created By: {selectedTask.assignedBy} {selectedTask.createdByRole ? `(${selectedTask.createdByRole.replace(/_/g, ' ')})` : ''}
                </div>
                <div className="small text-white-50 d-flex align-items-center gap-1">
                  <UserIcon style={{ width: '0.875rem' }} /> 
                  Assigned To: {selectedTask.assignedTo} {selectedTask.assignedToRole ? `(${selectedTask.assignedToRole.replace(/_/g, ' ')})` : ''}
                </div>
                <div className="small text-white-50 d-flex align-items-center gap-1">
                  <CalendarIcon style={{ width: '0.875rem' }} /> 
                  {new Date(selectedTask.createdAt || Date.now()).toLocaleDateString('en-GB')}
                </div>
              </div>
            </Modal.Header>
            <Modal.Body className="p-4">
              <div className="mb-4">
                <div className="small text-muted mb-1 text-uppercase fw-bold tracking-wider" style={{ fontSize: '0.65rem' }}>Task Title</div>
                <h6 className="fw-bold text-dark">{selectedTask.title}</h6>
              </div>
              
              <Row className="g-3 mb-4">
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Priority</div>
                    <Badge bg={getPriorityColor(selectedTask.priority)} className="rounded-pill px-2 py-1 uppercase" style={{ fontSize: '0.6rem' }}>{selectedTask.priority}</Badge>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Status</div>
                    <Badge bg={getStatusColor(selectedTask.status) === 'orange' ? '' : getStatusColor(selectedTask.status)} className={`rounded-pill px-2 py-1 uppercase ${getStatusColor(selectedTask.status) === 'orange' ? 'bg-orange' : ''}`} style={{ fontSize: '0.6rem' }}>{selectedTask.status}</Badge>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Due Date</div>
                    <span className="small fw-bold">{new Date(selectedTask.dueDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Progress</div>
                    <span className="small fw-bold text-primary">{selectedTask.progress || 0}%</span>
                    <ProgressBar now={selectedTask.progress || 0} style={{ height: '4px', marginTop: '4px' }} className="rounded-pill" />
                  </div>
                </Col>
              </Row>
              
              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Description</div>
                <p className="small text-dark mb-0">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="small text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Remarks History</div>
                {selectedTask.remarks?.length > 0 ? (
                  <div className="vstack gap-2 overflow-auto pr-1" style={{ maxHeight: '150px' }}>
                    {selectedTask.remarks.map((r, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-2 border small border-light-subtle">
                        {r.remark || r}
                      </div>
                    ))}
                  </div>
                ) : <p className="small text-muted italic mb-0">No remarks yet.</p>}
              </div>
              
              {selectedTask.attachments?.length > 0 && (
                <div className="bg-light p-3 rounded-3 mb-4">
                  <div className="small text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Attachments</div>
                  <div className="vstack gap-2">
                    {selectedTask.attachments.map((file, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-light-subtle">
                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                          <PaperClipIcon style={{ width: '1rem', height: '1rem' }} className="text-secondary flex-shrink-0" />
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="small text-primary text-truncate text-decoration-none fw-medium">
                            {file.name}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button variant="danger" className="w-100 py-3 fw-bold rounded-3 border-0 transition-all text-white" onClick={() => setShowDetailsModal(false)}>
                Close Details
              </Button>
            </Modal.Body>
          </div>
        )}
      </Modal>

      {/* Remark Modal */}
      <Modal show={isRemarkModalOpen} onHide={() => setIsRemarkModalOpen(false)} centered>
        <Modal.Header closeButton className="border-0 p-4 pb-0">
          <Modal.Title className="fw-bold h5">Add Remark</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="small text-secondary fw-bold">Your Remark</Form.Label>
            <Form.Control as="textarea" rows={4} value={remarkText} onChange={(e) => setRemarkText(e.target.value)} 
              placeholder="Type your message here..." className="rounded-3 border-light-subtle" />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button variant="light" className="flex-grow-1 fw-bold rounded-3" onClick={() => setIsRemarkModalOpen(false)}>Cancel</Button>
            <Button variant="success" className="flex-grow-1 fw-bold rounded-3 text-white" onClick={() => handleAddRemark(remarkTask?.id, remarkText)}>Submit</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Forward Modal */}
      <Modal show={isForwardModalOpen} onHide={() => setIsForwardModalOpen(false)} centered>
        <Modal.Header closeButton className="border-0 p-4 pb-0">
          <Modal.Title className="fw-bold h5">Forward Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-4">
            <Form.Label className="small text-secondary fw-bold">Select Recipient</Form.Label>
            <Form.Select className="rounded-3 border-light-subtle" onChange={(e) => handleConfirmForward(e.target.value)}>
              <option value="">Choose Subordinate Officer...</option>
              {subordinates.map(sub => (
                <option key={sub.userID} value={sub.userID}>{sub.name} - {sub.role?.replace(/_/g, ' ')}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant="light" className="w-100 fw-bold rounded-3" onClick={() => setIsForwardModalOpen(false)}>Close</Button>
        </Modal.Body>
      </Modal>

      {/* Update Progress Modal */}
      <Modal show={isUpdateModalOpen} onHide={() => setIsUpdateModalOpen(false)} centered>
        <Modal.Header closeButton className="border-0 p-4 pb-0">
          <Modal.Title className="fw-bold h5">Update Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-4">
            <Form.Label className="small text-secondary fw-bold">Target Achievement</Form.Label>
            <Form.Control type="number" value={updateAchievementValue} onChange={(e) => setUpdateAchievementValue(e.target.value)} 
              className="rounded-3 border-light-subtle" placeholder="Enter achievement value..." />
            <Form.Text className="text-muted small">Target for this task is {updateTaskObj?.target || '100'}%</Form.Text>
          </Form.Group>
          <div className="d-flex gap-2">
            <Button variant="light" className="flex-grow-1 fw-bold rounded-3" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-grow-1 fw-bold rounded-3" onClick={() => handleUpdateProgress(updateTaskObj?.id, updateAchievementValue)}>Update</Button>
          </div>
        </Modal.Body>
      </Modal>


    </div>
  );
};

export default TaskDashboard;