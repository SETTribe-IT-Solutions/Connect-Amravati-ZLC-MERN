import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const TaskDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // Changed to 'list' by default
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedTaskForRemark, setSelectedTaskForRemark] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  // Updated tasks data with new fields
  const [tasks, setTasks] = useState([
    {
      id: 1,
      srNo: 1,
      title: 'Land Survey for New Registration',
      description: 'Complete survey for 5 new land registration applications in Amravati district',
      priority: 'High',
      dueDate: '2024-03-20',
      assignedTo: 'Tehsildar Office',
      assignedToAvatar: 'TO',
      status: 'In Progress',
      comments: 3,
      attachments: 2,
      progress: 60,
      createdAt: '2024-03-10',
      target: '5 Surveys',
      achievement: '3 Completed',
      remark: 'Need additional manpower',
      files: ['survey_doc1.pdf', 'map.pdf']
    },
    {
      id: 2,
      srNo: 2,
      title: 'Revenue Collection Report',
      description: 'Submit monthly revenue collection report for March 2024',
      priority: 'Medium',
      dueDate: '2024-03-25',
      assignedTo: 'SDO Office',
      assignedToAvatar: 'SO',
      status: 'Pending',
      comments: 1,
      attachments: 0,
      progress: 0,
      createdAt: '2024-03-11',
      target: '₹50L Collection',
      achievement: '₹32L Collected',
      remark: '',
      files: []
    },
    {
      id: 3,
      srNo: 3,
      title: 'Gram Sabha Meeting Minutes',
      description: 'Document and upload minutes of Gram Sabha meeting',
      priority: 'Low',
      dueDate: '2024-03-18',
      assignedTo: 'Gram Sevak',
      assignedToAvatar: 'GS',
      status: 'Completed',
      comments: 5,
      attachments: 3,
      progress: 100,
      createdAt: '2024-03-09',
      target: 'Minutes Documented',
      achievement: 'Completed',
      remark: 'Meeting was productive',
      files: ['minutes.pdf', 'attendance.xlsx']
    },
    {
      id: 4,
      srNo: 4,
      title: 'Infrastructure Development Report',
      description: 'Prepare report on ongoing infrastructure projects in the district',
      priority: 'High',
      dueDate: '2024-03-15',
      assignedTo: 'BDO Office',
      assignedToAvatar: 'BO',
      status: 'Overdue',
      comments: 2,
      attachments: 1,
      progress: 30,
      createdAt: '2024-03-08',
      target: '10 Projects',
      achievement: '3 Completed',
      remark: 'Delay due to approval',
      files: ['project_report.docx']
    },
  ]);

  // Statistics
  const stats = [
    { 
      title: 'Total Tasks', 
      value: tasks.length, 
      icon: ClockIcon, 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%'
    },
    { 
      title: 'Completed', 
      value: tasks.filter(t => t.status === 'Completed').length, 
      icon: CheckCircleIcon, 
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%'
    },
    { 
      title: 'In Progress', 
      value: tasks.filter(t => t.status === 'In Progress').length, 
      icon: ArrowPathIcon, 
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '-3%'
    },
    { 
      title: 'Overdue', 
      value: tasks.filter(t => t.status === 'Overdue').length, 
      icon: ExclamationTriangleIcon, 
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: '+5%'
    },
  ];

  // Helper functions
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'In Progress': return <ArrowPathIcon className="h-5 w-5 text-yellow-500" />;
      case 'Overdue': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter tasks based on search and filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || task.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Handle delete
  const handleDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setShowDeletePopup(false);
    setTaskToDelete(null);
  };

  // Handle remark save
  const handleRemarkSave = (taskId, newRemark) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, remark: newRemark } : task
    ));
    setShowRemarkModal(false);
    setSelectedTaskForRemark(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Task Management
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
              Monitor and manage all departmental tasks
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedTask(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Create Task
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-xs mt-2 flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{stat.change.startsWith('+') ? '↑' : '↓'}</span> {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-2xl`}>
                <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title, description, or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tasks Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      task.status === 'Completed' ? 'bg-green-50' : 
                      task.status === 'In Progress' ? 'bg-yellow-50' : 
                      task.status === 'Overdue' ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedTask(task);
                        setIsModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => {
                        setTaskToDelete(task);
                        setShowDeletePopup(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {task.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {task.description}
                </p>

                {/* Target & Achievement */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-indigo-50 rounded-lg p-2">
                    <p className="text-xs text-indigo-600">Target</p>
                    <p className="text-sm font-semibold text-indigo-700">{task.target}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-600">Achievement</p>
                    <p className="text-sm font-semibold text-green-700">{task.achievement}</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 text-gray-400" />
                    <span>Assigned to: </span>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                        {task.assignedToAvatar}
                      </div>
                      <span className="font-medium text-gray-900">{task.assignedTo}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>Due: <span className="font-medium text-gray-900">{task.dueDate}</span></span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                {/* Progress Bar for In Progress Tasks */}
                {task.status === 'In Progress' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900 font-medium">{task.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Remark */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Remark:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                    {task.remark || 'No remark added'}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    {task.comments > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span>{task.comments}</span>
                      </div>
                    )}
                    {task.attachments > 0 && (
                      <button 
                        onClick={() => alert(`Files: ${task.files.join(', ')}`)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PaperClipIcon className="h-4 w-4" />
                        <span>{task.attachments}</span>
                      </button>
                    )}
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    View Details
                    <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Enhanced List View with all new columns
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Sr. No</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Task</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Assigned To</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Target</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Achievement</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Attachment</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Remark</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{task.srNo}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                          {task.assignedToAvatar}
                        </div>
                        <span className="text-sm text-gray-600">{task.assignedTo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{task.dueDate}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-indigo-600">{task.target}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-green-600">{task.achievement}</span>
                    </td>
                    <td className="py-4 px-4">
                      {task.attachments > 0 ? (
                        <button 
                          onClick={() => alert(`Files: ${task.files.join(', ')}`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <PaperClipIcon className="h-4 w-4" />
                          <span className="text-xs">{task.attachments} file(s)</span>
                        </button>
                      ) : (
                        <button className="flex items-center gap-1 text-gray-400 hover:text-blue-600">
                          <PaperClipIcon className="h-4 w-4" />
                          <span className="text-xs">Add</span>
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {task.remark ? (
                        <button 
                          onClick={() => {
                            setSelectedTaskForRemark(task);
                            setRemarkText(task.remark);
                            setShowRemarkModal(true);
                          }}
                          className="text-sm text-gray-600 hover:text-blue-600 line-clamp-1 max-w-[150px]"
                        >
                          {task.remark}
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedTaskForRemark(task);
                            setRemarkText('');
                            setShowRemarkModal(true);
                          }}
                          className="text-xs text-gray-400 hover:text-blue-600"
                        >
                          Add Remark
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedTask(task);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setTaskToDelete(task);
                            setShowDeletePopup(true);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal 
            task={selectedTask} 
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTask(null);
            }} 
            onSave={(taskData) => {
              if (selectedTask) {
                // Update existing task
                setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, ...taskData } : t));
              } else {
                // Create new task
                const newTask = {
                  ...taskData,
                  id: tasks.length + 1,
                  srNo: tasks.length + 1,
                  comments: 0,
                  attachments: 0,
                  assignedToAvatar: taskData.assignedTo.split(' ').map(n => n[0]).join('').substring(0, 2),
                  createdAt: new Date().toISOString().split('T')[0],
                  files: []
                };
                setTasks([newTask, ...tasks]);
              }
              setIsModalOpen(false);
              setSelectedTask(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Popup */}
      <AnimatePresence>
        {showDeletePopup && taskToDelete && (
          <DeletePopup 
            task={taskToDelete}
            onConfirm={handleDelete}
            onCancel={() => {
              setShowDeletePopup(false);
              setTaskToDelete(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Remark Modal */}
      <AnimatePresence>
        {showRemarkModal && selectedTaskForRemark && (
          <RemarkModal 
            task={selectedTaskForRemark}
            remark={remarkText}
            onSave={handleRemarkSave}
            onClose={() => {
              setShowRemarkModal(false);
              setSelectedTaskForRemark(null);
              setRemarkText('');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Task Modal Component (Updated with Target & Achievement fields)
const TaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate || '',
    assignedTo: task?.assignedTo || '',
    status: task?.status || 'Pending',
    target: task?.target || '',
    achievement: task?.achievement || '',
    remark: task?.remark || ''
  });

  const users = [
    { id: 1, name: 'Tehsildar Office', role: 'Tehsildar' },
    { id: 2, name: 'SDO Office', role: 'SDO' },
    { id: 3, name: 'Gram Sevak - Village A', role: 'Gram Sevak' },
    { id: 4, name: 'Talathi - Circle 1', role: 'Talathi' },
    { id: 5, name: 'BDO Office', role: 'BDO' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter task title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe the task details..."
              />
            </div>

            {/* Priority, Status and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Target and Achievement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target
                </label>
                <input
                  type="text"
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5 Surveys, ₹50L"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievement
                </label>
                <input
                  type="text"
                  value={formData.achievement}
                  onChange={(e) => setFormData({...formData, achievement: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3 Completed, ₹32L"
                />
              </div>
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark
              </label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({...formData, remark: e.target.value})}
                rows="2"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Add any remarks..."
              />
            </div>

            {/* Assign to */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.name}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <PaperClipIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Drag and drop files here, or{' '}
                  <span className="text-blue-600 font-medium">browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PDF, DOC, XLS, Images (Max 10MB)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              >
                {task ? 'Update Task' : 'Create Task'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Delete Confirmation Popup Component
const DeletePopup = ({ task, onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Task</h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete "{task?.title}"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(task.id)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Remark Modal Component
const RemarkModal = ({ task, remark, onSave, onClose }) => {
  const [localRemark, setLocalRemark] = useState(remark);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add Remark</h3>
          <p className="text-sm text-gray-600 mb-4">Task: {task?.title}</p>
          
          <textarea
            value={localRemark}
            onChange={(e) => setLocalRemark(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Enter your remark here..."
          />
          
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSave(task.id, localRemark);
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Save Remark
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskDashboard;