import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const canCreateTask = ['collector', 'additional collector', 'sdo', 'tehsildar'].includes(roleLower);

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
  const fileInputRef = useRef(null);
  
  // Popup helper function
  const showInfoPopup = (message, type = 'info') => {
    setShowPopup({ show: true, message, type });
    setTimeout(() => setShowPopup({ show: false, message: '', type: '' }), 2000);
  };

  // Mock data for tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Land',
      description: 'New Land Registrations - Complete registration of newly acquired government land parcels',
      department: 'Revenue',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Tehsildar Office',
      assignedType: 'role',
      dueDate: '2024-03-20',
      progress: 45,
      attachments: [{ name: 'land_survey.pdf', url: '#', size: '245 KB' }],
      remarks: ['Survey completed for 3 parcels', 'Need additional documents for 2 pending surveys'],
      target: '5 Surveys',
      achievement: '3 Completed',
      location: 'Tehsildar Office',
      timeline: [
        { date: '2024-03-10', action: 'Task Created', by: 'Shri. Ashish Yerekar (I.A.S.)' },
        { date: '2024-03-12', action: 'Assigned to Tehsildar', by: 'System' },
        { date: '2024-03-15', action: 'Survey Started', by: 'Tehsildar Office' }
      ]
    },
    {
      id: 2,
      title: 'Users',
      description: 'Revenue Collection Report - Quarterly revenue collection report for Amravati district',
      department: 'Finance',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'SDO Office',
      assignedType: 'role',
      dueDate: '2024-03-25',
      progress: 70,
      attachments: [{ name: 'q1_report.pdf', url: '#', size: '1.2 MB' }],
      remarks: ['Collection target 70% achieved'],
      target: '£50L Collection',
      achievement: '£35L Collected',
      location: 'SDO Office',
      timeline: [
        { date: '2024-03-05', action: 'Task Created', by: 'Shri. Ashish Yerekar (I.A.S.)' },
        { date: '2024-03-07', action: 'Assigned to SDO', by: 'System' }
      ]
    },
    {
      id: 3,
      title: 'Appreciation',
      description: 'Gram Sabha Meeting Minutes - Documentation of Gram Sabha meeting minutes',
      department: 'Administration',
      priority: 'Low',
      status: 'Pending',
      assignedTo: 'Gram Sevak',
      assignedType: 'role',
      dueDate: '2024-03-18',
      progress: 30,
      attachments: [],
      remarks: ['Meeting scheduled for next week'],
      target: 'Minutes Documented',
      achievement: 'In Progress',
      location: 'Gram Panchayat',
      timeline: [
        { date: '2024-03-08', action: 'Task Created', by: 'Shri. Ashish Yerekar (I.A.S.)' }
      ]
    },
    {
      id: 4,
      title: 'Structure',
      description: 'Infrastructure Development - Oversight of infrastructure projects',
      department: 'Development',
      priority: 'High',
      status: 'Overdue',
      assignedTo: 'BDO Office',
      assignedType: 'role',
      dueDate: '2024-03-15',
      progress: 60,
      attachments: [{ name: 'project_status.pdf', url: '#', size: '890 KB' }],
      remarks: ['Delay due to material shortage'],
      target: '10 Projects',
      achievement: '6 Completed',
      location: 'BDO Office',
      timeline: [
        { date: '2024-03-01', action: 'Task Created', by: 'Shri. Ashish Yerekar (I.A.S.)' },
        { date: '2024-03-03', action: 'Assigned to BDO', by: 'System' }
      ]
    },
    {
      id: 5,
      title: 'Supply',
      description: 'Water Supply Scheme - Implementation of water supply in 5 villages',
      department: 'Infrastructure',
      priority: 'High',
      status: 'Overdue',
      assignedTo: 'Executive Engineer',
      assignedType: 'role',
      dueDate: '2024-03-01',
      progress: 40,
      attachments: [{ name: 'scheme_details.pdf', url: '#', size: '567 KB' }],
      remarks: ['Delay in material supply'],
      target: '2 Villages Connected',
      achievement: '1 Connected',
      location: 'Executive Engineer Office',
      timeline: [
        { date: '2024-02-20', action: 'Task Created', by: 'Shri. Ashish Yerekar (I.A.S.)' }
      ]
    }
  ]);

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
    attachments: []
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
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesDept = selectedDepartment === 'all' || task.department === selectedDepartment;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Get pending/overdue tasks with filters
  const filteredPendingTasks = tasks.filter(t => {
    const isPending = t.status === 'Pending' || t.status === 'Overdue';
    const matchesSearch = t.title.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
                         t.description.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
                         t.assignedTo.toLowerCase().includes(pendingSearchTerm.toLowerCase());
    const matchesStatus = pendingStatusFilter === 'all' || t.status === pendingStatusFilter;
    return isPending && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-green-100 text-green-700';
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

  const handleCreateTask = (e) => {
    e.preventDefault();
    const taskToAdd = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      department: newTask.department,
      priority: newTask.priority,
      status: 'Pending',
      assignedTo: newTask.assignedTo,
      assignedType: newTask.assignedType,
      dueDate: newTask.dueDate ? newTask.dueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      progress: 0,
      attachments: newTask.attachments,
      remarks: ['Task created'],
      target: newTask.targetType === 'target' ? newTask.targetValue : 'NA',
      achievement: 'Not Started',
      location: newTask.location,
      timeline: [{ date: new Date().toISOString().split('T')[0], action: 'Task Created', by: 'Current User' }]
    };
    setTasks([...tasks, taskToAdd]);
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
      attachments: []
    });
    setShowCreateForm(false);
    showInfoPopup('Task created successfully!', 'success');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024).toFixed(1) + ' KB'
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

  const handleAddRemark = (taskId, remarkText) => {
    if (!remarkText?.trim()) {
      showInfoPopup('Please enter a remark', 'error');
      return;
    }
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, remarks: [...task.remarks, remarkText] }
        : task
    ));
    setRemarksInput({ ...remarksInput, [taskId]: '' });
    showInfoPopup('Remark added successfully!', 'success');
  };

  const handleForwardTask = (taskId, forwardTo) => {
    if (!forwardTo?.trim()) {
      showInfoPopup('Please enter who to forward to', 'error');
      return;
    }
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            assignedTo: forwardTo,
            timeline: [...task.timeline, { 
              date: new Date().toISOString().split('T')[0], 
              action: `Forwarded to ${forwardTo}`, 
              by: 'Current User' 
            }]
          }
        : task
    ));
    setForwardInput({ ...forwardInput, [taskId]: '' });
    showInfoPopup(`Task forwarded to ${forwardTo} successfully!`, 'success');
  };

  const handleUpdateProgress = (taskId, newProgress) => {
    const progress = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, progress: progress }
        : task
    ));
    showInfoPopup(`Progress updated to ${progress}%`, 'success');
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTaskForTracking(task);
    setShowTrackingDetails(true);
  };

  const getStatDetails = (statName, value) => {
    let details = '';
    switch(statName) {
      case 'Total':
        details = `Total tasks: ${value}\nBreakdown:\n- Completed: ${tasks.filter(t => t.status === 'Completed').length}\n- In Progress: ${tasks.filter(t => t.status === 'In Progress').length}\n- Pending: ${tasks.filter(t => t.status === 'Pending').length}\n- Overdue: ${tasks.filter(t => t.status === 'Overdue').length}`;
        break;
      case 'Completed':
        details = `Completed tasks: ${value}\nAchievement rate: ${((value/156)*100).toFixed(1)}%`;
        break;
      case 'In Progress':
        details = `In Progress tasks: ${value}\nTasks currently being worked on`;
        break;
      case 'Overdue':
        const overdueTasks = tasks.filter(t => t.status === 'Overdue');
        details = `Overdue tasks: ${value}\n\nDetails:\n${overdueTasks.map(t => `- ${t.title} (Due: ${t.dueDate})`).join('\n')}`;
        break;
      case 'Achievement':
        details = `Achievement: ${value}\nTarget: ₹75L\nAchievement Rate: 60.3%`;
        break;
      case 'Target':
        details = `Target: ${value}\nCurrent Achievement: ₹45.2L\nRemaining: ₹29.8L`;
        break;
      case 'Pending':
        details = `Pending tasks: ${value}\n- Overdue: ${tasks.filter(t => t.status === 'Overdue').length}\n- Pending: ${tasks.filter(t => t.status === 'Pending').length}`;
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
    { name: 'Total', value: '156', change: '+12%', color: 'blue', icon: DocumentTextIcon },
    { name: 'Completed', value: '98', change: '+8%', color: 'green', icon: CheckCircleIcon },
    { name: 'In Progress', value: '42', change: '-3%', color: 'amber', icon: ArrowPathIcon },
    { name: 'Overdue', value: '16', change: '+5%', color: 'red', icon: ClockIcon },
    { name: 'Achievement', value: '₹45.2L', change: '+15%', color: 'purple', icon: FlagIcon },
    { name: 'Target', value: '₹75L', change: '+15%', color: 'indigo', icon: ChartBarIcon },
    { name: 'Pending', value: '8', change: '+15%', color: 'orange', icon: ClockIcon },
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
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Task Management
          </h2>
          <p className="text-gray-500 mt-1">Create, track and manage all your tasks in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
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
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation - Aligned Left */}
        <div className="bg-white rounded-2xl shadow-md p-1.5 mb-8 inline-flex flex-wrap gap-1">
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
              className={`flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
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
                  <form onSubmit={handleCreateTask} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <option value="">Select Role</option>
                            <option value="Gram Talathi">Gram Talathi</option>
                            <option value="Grampanchayat Adhikari">Grampanchayat Adhikari</option>
                            <option value="SUB-DIVISIONAL OFFICERS">SUB-DIVISIONAL OFFICERS</option>
                            <option value="TAHSILDAR">TAHSILDAR</option>
                            <option value="TAHSILDAR- REVENUE">TAHSILDAR- REVENUE</option>
                          </select>
                        )}
                        
                        {(newTask.assignedType === 'employee' || newTask.assignedType === 'other') && (
                          <input
                            type="text"
                            value={newTask.assignedTo}
                            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${newTask.assignedType} name`}
                            required
                          />
                        )}
                        
                        {newTask.assignedType === 'village' && (
                          <input
                            type="text"
                            value={newTask.assignedTo}
                            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter village name"
                            required
                          />
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
                <div className="flex gap-4 mb-6">
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
                  <select
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={filterAnimation ? { scale: [1, 1.05, 1] } : {}}
                      onClick={handleApplyFilters}
                      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <FunnelIcon className="h-5 w-5 mr-2" />
                      Apply Filters
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleResetFilters}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Reset
                    </motion.button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">TASK</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">PRIORITY</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">STATUS</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ASSIGNED TO</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DUE DATE</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">TARGET</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ACHIEVEMENT</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ATTACHMENTS</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">REMARK</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{task.description.substring(0, 50)}...</p>
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
                              <button
                                onClick={() => showInfoPopup(`${task.attachments.length} attachment(s)`, 'info')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <PaperClipIcon className="h-5 w-5" />
                              </button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                const remarkInput = prompt('Enter remark:', '');
                                if (remarkInput) handleAddRemark(task.id, remarkInput);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Add Remark"
                            >
                              <ChatBubbleLeftRightIcon className="h-5 w-5" />
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
                              <button
                                onClick={() => {
                                  const forwardTo = prompt('Forward to (name/role):', '');
                                  if (forwardTo) handleForwardTask(task.id, forwardTo);
                                }}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Forward"
                              >
                                <PaperAirplaneIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const progress = prompt('Update progress (0-100):', task.progress);
                                  if (progress) handleUpdateProgress(task.id, progress);
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                title="Update Progress"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
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
                    {tasks.filter(t => t.status === 'Pending' || t.status === 'Overdue').length}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPendingStatusFilter('Pending')}
                  className={`rounded-xl p-4 cursor-pointer transition-all ${pendingStatusFilter === 'Pending' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-700 hover:shadow-md'}`}
                >
                  <p className="text-sm font-medium">Pending Tasks</p>
                  <p className={`text-2xl font-bold ${pendingStatusFilter === 'Pending' ? 'text-white' : 'text-orange-700'}`}>
                    {tasks.filter(t => t.status === 'Pending').length}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPendingStatusFilter('Overdue')}
                  className={`rounded-xl p-4 cursor-pointer transition-all ${pendingStatusFilter === 'Overdue' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' : 'bg-red-50 text-red-700 hover:shadow-md'}`}
                >
                  <p className="text-sm font-medium">Overdue Tasks</p>
                  <p className={`text-2xl font-bold ${pendingStatusFilter === 'Overdue' ? 'text-white' : 'text-red-700'}`}>
                    {tasks.filter(t => t.status === 'Overdue').length}
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
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Task</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingTasks.map((task) => {
                        const daysOverdue = task.status === 'Overdue' ? getDaysOverdue(task.dueDate) : 0;
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
                              {task.status === 'Overdue' && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
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
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Created By: Shri. Ashish Yerekar (I.A.S.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created on: {selectedTaskForTracking.timeline?.[0]?.date || new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                
                <div>
                  <p className="text-xs text-gray-500 font-medium">Description</p>
                  <p className="text-gray-700">{selectedTaskForTracking.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Target</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <FlagIcon className="h-4 w-4 text-gray-400" />
                      {selectedTaskForTracking.target || 'NA'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Achievement</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      {selectedTaskForTracking.achievement || 'Not Started'}
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
    </div>
  );
};

export default TaskDashboard;