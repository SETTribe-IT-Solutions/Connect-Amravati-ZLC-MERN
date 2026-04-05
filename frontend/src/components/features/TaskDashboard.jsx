import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTasks, createTask, updateTaskStatus, addTaskRemark, updateTaskProgressAPI, forwardTaskAPI } from '../../services/taskService';
import { getAllUsers } from '../../services/userService';

import { motion, AnimatePresence } from 'framer-motion';
// ... rest of icons ...
import { 
  PlusCircleIcon, 
  ArrowPathIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  FlagIcon,
  EyeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TaskDashboard = ({ user }) => {
  const role = user?.role || localStorage.getItem('role') || 'user';
  const roleLower = role.toLowerCase();
  
  const roleHierarchy = {
    'COLLECTOR': 1,
    'ADDITIONAL_DEPUTY_COLLECTOR': 2,
    'SDO': 3,
    'TEHSILDAR': 4,
    'BDO': 5,
    'TALATHI': 6,
    'GRAMSEVAK': 7,
    'SYSTEM_ADMINISTRATOR': 99
  };
  const currentUserLevel = roleHierarchy[role.toUpperCase().replace(/\s+/g, '_')] || 99;

  const canCreateTask = [
    'collector', 
    'additional collector', 
    'additional_deputy_collector', 
    'additional deputy collector', 
    'sdo', 
    'tehsildar',
    'system administrator',
    'admin'
  ].includes(roleLower.replace(/\s+/g, '_')) || [
    'collector', 
    'additional collector', 
    'sdo', 
    'tehsildar',
    'admin'
  ].includes(roleLower);

  const [activeTab, setActiveTab] = useState(canCreateTask ? 'create' : 'tracking');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPopup, setShowPopup] = useState({ show: false, message: '', type: '' });
  const [filterAnimation, setFilterAnimation] = useState(false);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [pendingStatusFilter, setPendingStatusFilter] = useState('all');
  const [expandedTasks, setExpandedTasks] = useState({});
  const [remarksInput, setRemarksInput] = useState({});
  const [forwardInput, setForwardInput] = useState({});
  const [forwardModalConfig, setForwardModalConfig] = useState({ show: false, task: null, selectedUserId: '' });
  const fileInputRef = useRef(null);
  
  // Popup helper function
  const showInfoPopup = (message, type = 'info') => {
    setShowPopup({ show: true, message, type });
    setTimeout(() => setShowPopup({ show: false, message: '', type: '' }), 2000);
  };

  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      if (user?.userID || localStorage.getItem('userID')) {
        setLoading(true);
        const data = await getTasks();
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const serverURL = baseURL.replace('/api', '');
        


        const mapped = (data || []).map(t => ({
          ...t,
          description: t.description || '', // Null safety
          assignedTo: t.assignedToName || 'N/A',
          status: t.status ? t.status.toString().toUpperCase() : 'PENDING',
          priority: t.priority ? t.priority.toString().toUpperCase() : 'MEDIUM',
          attachments: t.attachment ? [{
             name: t.attachment,
             url: `${serverURL}/uploads/${t.attachment}`
          }] : [] 
        }));
        setTasks(mapped);
      }
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const requesterId = localStorage.getItem('userID');
      const data = await getAllUsers(requesterId);
      setStaff(data || []);
    } catch (error) {
      console.error("Fetch Staff Error:", error);
    }
  };

  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlightId');

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, [user]);

  useEffect(() => {
    if (highlightId && tasks.length > 0) {
      // Switch to tracking tab to see the task list
      setActiveTab('tracking');
      
      // Expand the specific task
      setExpandedTasks(prev => ({
        ...prev,
        [highlightId]: true
      }));

      // Scroll to the task after a short delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(`task-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
          setTimeout(() => element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 3000);
        }
      }, 500);
    }
  }, [highlightId, tasks.length]);

  // Form state for creating new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    department: 'Revenue',
    priority: 'Medium',
    assignedType: 'role',
    assignedTo: '',
    dueDate: null,
    targetType: 'target',
    targetValue: '',
    location: '',
    attachments: [],
    selectedVillage: '', // New state for village filtering
    otherAssignedTo: '' // New state for manual 'Other' input
  });

  const [selectedTaskForTracking, setSelectedTaskForTracking] = useState(null);
  const [showTrackingDetails, setShowTrackingDetails] = useState(false);

  const allTabs = [
    { id: 'create', name: 'Create Task', icon: PlusCircleIcon },
    { id: 'tracking', name: 'Task Tracking', icon: ArrowPathIcon },
    { id: 'pending', name: 'Pending Report', icon: ClockIcon },
  ];

  const tabs = canCreateTask ? allTabs : allTabs.filter(tab => tab.id !== 'create');

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus.replace(/\s+/g, '_').toUpperCase();
    const matchesDept = selectedDepartment === 'all' || task.department === selectedDepartment;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Get pending/overdue tasks with filters
  const filteredPendingTasks = tasks.filter(t => {
    const isPending = t.status === 'PENDING' || t.status === 'OVERDUE';
    const matchesSearch = t.title.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
                         t.description.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
                         t.assignedTo.toLowerCase().includes(pendingSearchTerm.toLowerCase());
    const matchesStatus = pendingStatusFilter === 'all' || t.status === pendingStatusFilter.toUpperCase();
    return isPending && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const s = status?.toUpperCase() || '';
    switch(s) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase() || '';
    switch(p) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      case 'LOW': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const validateTaskForm = () => {
    if (!newTask.title?.trim()) {
      showInfoPopup('Task title is required', 'error');
      return false;
    }
    if (!newTask.assignedTo) {
      showInfoPopup('Please select a person to assign this task to', 'error');
      return false;
    }
    if (!newTask.dueDate) {
      showInfoPopup('Please select a due date', 'error');
      return false;
    }
    if (newTask.targetType === 'target' && (!newTask.targetValue || isNaN(newTask.targetValue))) {
      showInfoPopup('Please enter a valid numeric target value', 'error');
      return false;
    }
    return true;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!validateTaskForm()) return;

    try {
      const userID = user?.userID || localStorage.getItem('userID');
      if (!userID) {
        showInfoPopup('User session not found. Please log in again.', 'error');
        return;
      }

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || '',
        department: newTask.department,
        priority: (newTask.priority || 'Medium').toUpperCase(),
        assignedTo: Number(newTask.assignedTo),
        requesterId: Number(userID),
        dueDate: newTask.dueDate.toISOString().split('T')[0],
        target: newTask.targetType === 'target' ? Number(newTask.targetValue) : null,
        location: newTask.location?.trim() || '',
        progress: 0
      };

      console.log("Creating Task with Payload:", taskData);

      const formData = new FormData();
      formData.append('task', new Blob([JSON.stringify(taskData)], {
        type: 'application/json'
      }));
      
      if (newTask.attachments?.length > 0 && newTask.attachments[0].file) {
        formData.append('file', newTask.attachments[0].file);
      }
      
      await createTask(formData);
      fetchTasks();
      
      setNewTask({
        title: '',
        description: '',
        department: 'Revenue',
        priority: 'Medium',
        assignedType: 'role',
        assignedTo: '',
        dueDate: null,
        targetType: 'target',
        targetValue: '',
        location: '',
        attachments: [],
        selectedVillage: '',
        otherAssignedTo: ''
      });
      setShowCreateForm(false);
      showInfoPopup('Task created successfully!', 'success');
    } catch (error) {
       console.error("Create Task Error:", error);
       const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create task';
       showInfoPopup(errorMessage, 'error');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024).toFixed(1) + ' KB',
      file: file
    }));
    setNewTask({ ...newTask, attachments: [...newTask.attachments, ...newAttachments] });
    showInfoPopup(`${files.length} file(s) uploaded successfully!`, 'success');
  };

  const handleRemoveAttachment = (index) => {
    const updatedAttachments = newTask.attachments.filter((_, i) => i !== index);
    setNewTask({ ...newTask, attachments: updatedAttachments });
    showInfoPopup('Attachment removed', 'info');
  };

  const handleApplyFilters = () => {
    setFilterAnimation(true);
    setTimeout(() => setFilterAnimation(false), 300);
    showInfoPopup('Filters applied successfully', 'info');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedDepartment('all');
    showInfoPopup('Filters reset', 'info');
  };

  const handleAddRemark = async (taskId, remarkText) => {
    if (!remarkText?.trim()) {
      showInfoPopup('Please enter a remark', 'error');
      return;
    }
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      await addTaskRemark(taskId, remarkText, userID);
      setRemarksInput({ ...remarksInput, [taskId]: '' });
      showInfoPopup('Remark added successfully!', 'success');
    } catch (error) {
      showInfoPopup('Failed to add remark', 'error');
    }
  };

  const submitForwardTask = async () => {
    const { task, selectedUserId } = forwardModalConfig;
    if (!selectedUserId) {
      showInfoPopup('Please select a user to forward to', 'error');
      return;
    }
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      await forwardTaskAPI(task.id, selectedUserId, userID);
      
      setForwardModalConfig({ show: false, task: null, selectedUserId: '' });
      fetchTasks();
      showInfoPopup(`Task forwarded successfully!`, 'success');
      
      // If we were on task details of THIS task, close it
      if (selectedTaskForTracking?.id === task.id) {
         setShowTrackingDetails(false);
      }
    } catch (error) {
      showInfoPopup(error.response?.data?.message || 'Failed to forward task', 'error');
    }
  };

  const handleUpdateProgress = async (taskId, newProgress) => {
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      await updateTaskProgressAPI(taskId, parseInt(newProgress) || 0, userID);
      fetchTasks();
      showInfoPopup(`Progress updated processing...`, 'success');
    } catch (error) {
      showInfoPopup(error.response?.data?.message || 'Failed to update progress', 'error');
    }
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTaskForTracking(task);
    setShowTrackingDetails(true);
  };

  const getStatDetails = (statName, value) => {
    let details = '';
    switch(statName) {
      case 'Total':
        details = `Total tasks: ${value}\nBreakdown:\n- Completed: ${tasks.filter(t => t.status === 'COMPLETED').length}\n- In Progress: ${tasks.filter(t => t.status === 'IN_PROGRESS').length}\n- Pending: ${tasks.filter(t => t.status === 'PENDING').length}\n- Overdue: ${tasks.filter(t => t.status === 'OVERDUE').length}`;
        break;
      case 'Completed':
        details = `Completed tasks: ${value}\nAchievement rate: ${((value/156)*100).toFixed(1)}%`;
        break;
      case 'In Progress':
        details = `In Progress tasks: ${value}\nTasks currently being worked on`;
        break;
      case 'Overdue':
        const overdueTasks = tasks.filter(t => t.status === 'OVERDUE');
        details = `Overdue tasks: ${value}\n\nDetails:\n${overdueTasks.map(t => `- ${t.title} (Due: ${t.dueDate})`).join('\n')}`;
        break;
      case 'Achievement':
        details = `Achievement: ${value}`;
        break;
      case 'Target':
        details = `Target: ${value}`;
        break;
      case 'Pending':
        const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
        const overdueCount = tasks.filter(t => t.status === 'OVERDUE').length;
        details = `Pending tasks: ${value}\n- Overdue: ${overdueCount}\n- Pending: ${pendingCount}`;
        break;
      default:
        details = `${statName}: ${value}`;
    }
    return details;
  };

  const getAssignedIcon = (type) => {
    switch(type) {
      case 'role': return <UsersIcon className="h-4 w-4" />;
      case 'employee': return <UserIcon className="h-4 w-4" />;
      case 'village': return <MapPinIcon className="h-4 w-4" />;
      default: return <BuildingOfficeIcon className="h-4 w-4" />;
    }
  };

  const stats = [
    { name: 'Total', value: tasks.length.toString(), change: '0%', color: 'blue', icon: DocumentTextIcon },
    { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length.toString(), change: '0%', color: 'green', icon: CheckCircleIcon },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length.toString(), change: '0%', color: 'amber', icon: ArrowPathIcon },
    { name: 'Overdue', value: tasks.filter(t => t.status === 'OVERDUE').length.toString(), change: '0%', color: 'red', icon: ClockIcon },
    { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length.toString(), change: '0%', color: 'orange', icon: ClockIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Popup Notification */}
      <AnimatePresence>
        {showPopup.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
            style={{
              background: showPopup.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         showPopup.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                         'linear-gradient(135deg, #3b82f6, #2563eb)'
            }}
          >
            <InformationCircleIcon className="h-5 w-5 text-white" />
            <span className="font-medium text-white">{showPopup.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-8">
        {/* Header Title - Aligned Left */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Task Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Create, track and manage all your tasks in one place</p>
        </div>

        {/* Stats Cards - Improved responsiveness for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.name}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const details = getStatDetails(stat.name, stat.value);
                showInfoPopup(details, 'info');
              }}
              className="bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{stat.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        <div className="bg-white rounded-2xl shadow-md p-1.5 mb-8 inline-flex flex-nowrap overflow-x-auto max-w-full custom-scrollbar gap-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'create') setShowCreateForm(false);
                showInfoPopup(`Switched to ${tab.name}`, 'info');
              }}
              className={`flex items-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {tab.name}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Create Task Tab */}
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {!showCreateForm ? (
                <div className="text-center py-20">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex flex-col items-center cursor-pointer"
                  >
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                      <PlusCircleIcon className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Click to create new task</h3>
                    <p className="text-gray-500">Create and manage your tasks efficiently</p>
                  </motion.div>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <PlusCircleIcon className="h-6 w-6" />
                      Create New Task
                    </h2>
                  </div>
                  <form onSubmit={handleCreateTask} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                        <input 
                          type="text"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter task title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                        <select
                          value={newTask.department}
                          onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Revenue</option>
                          <option>Finance</option>
                          <option>Administration</option>
                          <option>Development</option>
                          <option>Infrastructure</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Priority *</label>
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date *</label>
                        <DatePicker
                          selected={newTask.dueDate}
                          onChange={(date) => setNewTask({...newTask, dueDate: date})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholderText="Select due date"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Allocate To *</label>
                        <div className="flex gap-4 mb-3">
                          {['role', 'employee', 'village', 'other'].map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="assignedType"
                                value={type}
                                checked={newTask.assignedType === type}
                                onChange={(e) => setNewTask({...newTask, assignedType: e.target.value, assignedTo: ''})}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-sm capitalize font-medium text-gray-700">{type === 'other' ? 'Other' : type}</span>
                            </label>
                          ))}
                        </div>
                        
                        {newTask.assignedType === 'role' && (
                          <select
                            value={newTask.assignedTo}
                            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Staff Member</option>
                            {staff
                              .filter(u => u.role !== 'SYSTEM_ADMINISTRATOR')
                              .map(u => (
                                <option key={u.userID} value={u.userID}>
                                  {u.name} ({u.role.replace(/_/g, ' ')})
                                </option>
                              ))
                            }
                          </select>
                        )}
                        
                        {newTask.assignedType === 'employee' && (
                          <select
                            value={newTask.assignedTo}
                            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Specific Officer</option>
                            {staff.map(u => (
                              <option key={u.userID} value={u.userID}>{u.name} - {u.role}</option>
                            ))}
                          </select>
                        )}

                        {newTask.assignedType === 'village' && (
                          <div className="space-y-3">
                            <select
                              value={newTask.selectedVillage}
                              onChange={(e) => setNewTask({...newTask, selectedVillage: e.target.value, assignedTo: ''})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select Village</option>
                              {[...new Set(staff.map(u => u.village).filter(Boolean))].map(v => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                            
                            {newTask.selectedVillage && (
                              <select
                                value={newTask.assignedTo}
                                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                <option value="">Select Officer in {newTask.selectedVillage}</option>
                                {staff
                                  .filter(u => u.village === newTask.selectedVillage)
                                  .map(u => (
                                    <option key={u.userID} value={u.userID}>{u.name} - {u.role}</option>
                                  ))}
                              </select>
                            )}
                          </div>
                        )}

                        {newTask.assignedType === 'other' && (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={newTask.otherAssignedTo}
                              onChange={(e) => {
                                const val = e.target.value;
                                // Try to find someone matching by name if they type a name precisely
                                const found = staff.find(u => u.name.toLowerCase() === val.toLowerCase());
                                setNewTask({
                                  ...newTask, 
                                  otherAssignedTo: val, 
                                  assignedTo: found ? found.userID : val 
                                });
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter name or ID manually..."
                              required
                            />
                            {newTask.assignedTo && isNaN(newTask.assignedTo) && (
                               <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                 <InformationCircleIcon className="h-3 w-3" />
                                 Note: Manual entry might need to match an existing ID for the backend.
                               </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={newTask.location}
                          onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter location"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Target *</label>
                        <div className="flex gap-4 mb-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="targetType"
                              value="target"
                              checked={newTask.targetType === 'target'}
                              onChange={(e) => setNewTask({...newTask, targetType: e.target.value})}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Target</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="targetType"
                              value="na"
                              checked={newTask.targetType === 'na'}
                              onChange={(e) => setNewTask({...newTask, targetType: e.target.value, targetValue: 'NA'})}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">NA</span>
                          </label>
                        </div>
                        
                        {newTask.targetType === 'target' && (
                          <input
                            type="text"
                            value={newTask.targetValue}
                            onChange={(e) => setNewTask({...newTask, targetValue: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter target value"
                            required
                          />
                        )}
                        {newTask.targetType === 'na' && (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500 font-medium">Target set to NA</div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          multiple
                          className="hidden"
                        />
                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                          >
                            <PaperClipIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-500">Click to upload files</span>
                          </button>
                          
                          {newTask.attachments.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                              {newTask.attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                  <div className="flex items-center gap-2">
                                    <PaperClipIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{file.name}</span>
                                    <span className="text-xs text-gray-400">({file.size})</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                      <textarea 
                        rows="4"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter task description"
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all"
                      >
                        Create Task
                      </motion.button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          )}

          {/* Task Tracking Tab - Table Format */}
          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks by title or department..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                    <select
                      className="flex-1 sm:flex-initial px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={filterAnimation ? { scale: [1, 1.05, 1] } : {}}
                        onClick={handleApplyFilters}
                        className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Apply Filter
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleResetFilters}
                        className="flex-1 sm:flex-initial px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                      >
                        Reset
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">TASK</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">PRIORITY</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">STATUS</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">ASSIGNED TO</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">DUE DATE</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">TARGET</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">ACHIEVEMENT</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">FILES</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">REMARK</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} id={`task-${task.id}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{(task.description || '').substring(0, 50)}...</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {getAssignedIcon(task.assignedType)}
                              <span className="text-sm text-gray-600">{task.assignedTo}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{task.target || 'NA'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{task.achievement || 'Not Started'}</td>
                          <td className="px-4 py-3">
                            {task.attachments.length > 0 ? (
                              <a
                                href={task.attachments[0].url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                title="Download Attachment"
                              >
                                <PaperClipIcon className="h-5 w-5" />
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const remarkInput = prompt('Enter remark:', '');
                                if (remarkInput) handleAddRemark(task.id, remarkInput);
                              }}
                              className="text-green-600 hover:text-green-800 p-1.5 bg-green-50 rounded-lg shadow-sm font-bold text-xs flex items-center gap-1"
                              title="Add Remark"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4" />
                              Remark
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewTaskDetails(task)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              { task.assignedToId === (user?.userID || parseInt(localStorage.getItem('userID'))) && task.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => {
                                    setForwardModalConfig({ show: true, task: task, selectedUserId: '' });
                                  }}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="Forward"
                                >
                                  <PaperAirplaneIcon className="h-4 w-4" />
                                </button>
                              )}
                              { (task.createdById === (user?.userID || parseInt(localStorage.getItem('userID'))) || task.assignedToId === (user?.userID || parseInt(localStorage.getItem('userID')))) && (
                                <button
                                  onClick={() => {
                                    let text = 'Update progress percentage (0-100):';
                                    let defaultVal = task.progress;
                                    
                                    if (task.target && task.target !== 'NA') {
                                        text = `Update achievement (Target is ${task.target}):`;
                                        defaultVal = task.achievement || 0;
                                    }

                                    const progress = prompt(text, defaultVal);
                                    if (progress !== null && progress !== "") handleUpdateProgress(task.id, progress);
                                  }}
                                  className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                  title="Update Progress/Achievement"
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending Task Report Tab - Grey, Orange, Red colors */}
          {activeTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPendingStatusFilter('all')}
                  className={`rounded-xl p-4 cursor-pointer transition-all ${pendingStatusFilter === 'all' ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:shadow-md'}`}
                >
                  <p className="text-sm font-medium">All Pending</p>
                  <p className={`text-2xl font-bold ${pendingStatusFilter === 'all' ? 'text-white' : 'text-gray-700'}`}>
                    {tasks.filter(t => t.status === 'PENDING' || t.status === 'OVERDUE').length}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPendingStatusFilter('Pending')}
                  className={`rounded-xl p-4 cursor-pointer transition-all ${pendingStatusFilter === 'Pending' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-700 hover:shadow-md'}`}
                >
                  <p className="text-sm font-medium">Pending Tasks</p>
                  <p className={`text-2xl font-bold ${pendingStatusFilter === 'Pending' ? 'text-white' : 'text-orange-700'}`}>
                    {tasks.filter(t => t.status === 'PENDING').length}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPendingStatusFilter('Overdue')}
                  className={`rounded-xl p-4 cursor-pointer transition-all ${pendingStatusFilter === 'Overdue' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' : 'bg-red-50 text-red-700 hover:shadow-md'}`}
                >
                  <p className="text-sm font-medium">Overdue Tasks</p>
                  <p className={`text-2xl font-bold ${pendingStatusFilter === 'Overdue' ? 'text-white' : 'text-red-700'}`}>
                    {tasks.filter(t => t.status === 'OVERDUE').length}
                  </p>
                </motion.div>
              </div>
              
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pending tasks..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  value={pendingSearchTerm}
                  onChange={(e) => setPendingSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                {filteredPendingTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No pending tasks found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Task</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Department</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Priority</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Due Date</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Owner</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingTasks.map((task) => {
                        const daysOverdue = task.status === 'OVERDUE' ? getDaysOverdue(task.dueDate) : 0;
                        return (
                          <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-500">{task.description.substring(0, 50)}...</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{task.department}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(task.dueDate).toLocaleDateString()}
                              {task.status === 'OVERDUE' && (
                                <p className="text-xs text-red-500 mt-1">({daysOverdue} days overdue)</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-1">
                              {getAssignedIcon(task.assignedType)}
                              <span>{task.assignedTo}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleViewTaskDetails(task)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="View Details"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveTab('tracking');
                                    showInfoPopup(`Navigate to Task Tracking for ${task.title}`, 'info');
                                  }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Track Task"
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {showTrackingDetails && selectedTaskForTracking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTrackingDetails(false)}
          >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-2"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-xl font-bold">Task Details</h3>
                <button
                  onClick={() => setShowTrackingDetails(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">Created By:</span>
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{selectedTaskForTracking.createdByName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-xs sm:text-sm text-gray-600">Created on: {selectedTaskForTracking.timeline?.[0]?.date || new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Task Title</p>
                    <p className="font-semibold text-gray-900">{selectedTaskForTracking.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Assigned To</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      {getAssignedIcon(selectedTaskForTracking.assignedType)}
                      {selectedTaskForTracking.assignedTo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Priority</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTaskForTracking.priority)}`}>
                      {selectedTaskForTracking.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTaskForTracking.status)}`}>
                      {selectedTaskForTracking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Due Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedTaskForTracking.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: `${selectedTaskForTracking.progress}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{selectedTaskForTracking.progress}%</span>
                    </div>
                  </div>
                </div>
                
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedTaskForTracking.description}</p>
                  </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Target</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-1">
                      <FlagIcon className="h-4 w-4 text-blue-400" />
                      {selectedTaskForTracking.target || 'NA'}
                    </p>
                  </div>
                  <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Achievement</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      {selectedTaskForTracking.achievement || '0'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-2">Timeline</p>
                  <div className="space-y-2">
                    {selectedTaskForTracking.timeline?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          {idx !== (selectedTaskForTracking.timeline?.length || 0) - 1 && (
                            <div className="absolute top-3 left-0.5 w-0.5 h-full bg-gray-300"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.action}</p>
                          <p className="text-xs text-gray-500">{item.date} • By: {item.by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedTaskForTracking.remarks?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Remarks</p>
                    <div className="space-y-1">
                      {selectedTaskForTracking.remarks.map((remark, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span>{remark}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forward Task Modal */}
      <AnimatePresence>
        {forwardModalConfig.show && forwardModalConfig.task && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setForwardModalConfig({ show: false, task: null, selectedUserId: '' })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <PaperAirplaneIcon className="h-6 w-6" />
                  Forward Task
                </h3>
                <button
                  onClick={() => setForwardModalConfig({ show: false, task: null, selectedUserId: '' })}
                  className="p-1 hover:bg-white/20 rounded-full transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Task to Forward:</p>
                  <p className="font-semibold text-gray-900">{forwardModalConfig.task.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select lower authority officer *</label>
                  <select
                    value={forwardModalConfig.selectedUserId}
                    onChange={(e) => setForwardModalConfig({ ...forwardModalConfig, selectedUserId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  >
                    <option value="">-- Select Officer --</option>
                    {staff
                      // Exclude the current user from the forward dropdown
                      .filter(u => u.userID !== (user?.userID || parseInt(localStorage.getItem('userID'))))
                      // Exclude higher authorities based on hierarchy level (higher number = lower authority)
                      .filter(u => {
                          const targetRole = u.role ? u.role.toUpperCase().replace(/\s+/g, '_') : '';
                          const targetLevel = roleHierarchy[targetRole] || 99;
                          // A user can only forward down the chain (where currentUserLevel < targetLevel)
                          return currentUserLevel < targetLevel;
                      })
                      .map(u => (
                      <option key={u.userID} value={u.userID}>
                        {u.name} - {u.role.replace(/_/g, ' ')} {u.village ? `(${u.village})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2 flex gap-1">
                    <InformationCircleIcon className="h-4 w-4" />
                    Ensure the selected officer is structurally below you in the hierarchy.
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setForwardModalConfig({ show: false, task: null, selectedUserId: '' })}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitForwardTask}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all"
                  >
                    Forward Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskDashboard;