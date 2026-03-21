import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircleIcon, 
  ArrowPathIcon, 
  ClockIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TaskDashboard = () => {
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'tracking', 'pending'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });

  // Mock data for tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'New Land Registrations',
      description: 'Complete registration of newly acquired government land parcels',
      department: 'Revenue',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Tehsildar Office',
      dueDate: '2024-03-20',
      progress: 45,
      attachments: 2,
      remarks: ['Survey completed for 3 parcels', 'Need additional documents for 2 pending surveys']
    },
    {
      id: 2,
      title: 'Revenue Collection Report',
      description: 'Quarterly revenue collection report for Amravati district',
      department: 'Finance',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'SDO Office',
      dueDate: '2024-03-25',
      progress: 70,
      attachments: 1,
      remarks: ['Collection target 70% achieved']
    },
    {
      id: 3,
      title: 'Gram Sabha Meeting Minutes',
      description: 'Documentation of Gram Sabha meeting minutes',
      department: 'Administration',
      priority: 'Low',
      status: 'Pending',
      assignedTo: 'Gram Sevak',
      dueDate: '2024-03-18',
      progress: 30,
      attachments: 3,
      remarks: ['Meeting scheduled for next week']
    },
    {
      id: 4,
      title: 'Infrastructure Development',
      description: 'Oversight of infrastructure projects',
      department: 'Development',
      priority: 'High',
      status: 'Overdue',
      assignedTo: 'BDO Office',
      dueDate: '2024-03-15',
      progress: 60,
      attachments: 1,
      remarks: ['Delay due to material shortage']
    },
    {
      id: 5,
      title: 'Water Supply Scheme',
      description: 'Implementation of water supply in 5 villages',
      department: 'Infrastructure',
      priority: 'High',
      status: 'Overdue',
      assignedTo: 'Executive Engineer',
      dueDate: '2024-03-01',
      progress: 40,
      attachments: 4,
      remarks: ['Delay in material supply']
    }
  ]);

  // Form state for creating new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    department: 'Revenue',
    priority: 'Medium',
    assignedTo: '',
    dueDate: null,
    target: '',
    location: ''
  });

  const tabs = [
    { id: 'create', name: 'Create Task', icon: PlusCircleIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'tracking', name: 'Task Tracking', icon: ArrowPathIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'pending', name: 'Pending Report', icon: ClockIcon, color: 'from-orange-500 to-red-500' },
  ];

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesDept = selectedDepartment === 'all' || task.department === selectedDepartment;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Get pending/overdue tasks
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'Overdue');

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      ...newTask,
      status: 'Pending',
      progress: 0,
      attachments: 0,
      remarks: ['Task created']
    };
    setTasks([...tasks, taskToAdd]);
    setShowCreateForm(false);
    setNewTask({
      title: '',
      description: '',
      department: 'Revenue',
      priority: 'Medium',
      assignedTo: '',
      dueDate: null,
      target: '',
      location: ''
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Task Management
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
          Create, track and manage all your tasks in one place
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold text-gray-900">156</p>
          <p className="text-xs text-green-600">↑ +12%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-lg font-bold text-green-600">98</p>
          <p className="text-xs text-green-600">↑ +8%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-lg font-bold text-yellow-600">42</p>
          <p className="text-xs text-red-600">↓ -3%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-red-500">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-lg font-bold text-red-600">16</p>
          <p className="text-xs text-red-600">↑ +5%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-purple-500">
          <p className="text-xs text-gray-500">Achievement</p>
          <p className="text-lg font-bold text-purple-600">₹45.2L</p>
          <p className="text-xs text-purple-600">↑ +15%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-indigo-500">
          <p className="text-xs text-gray-500">Target</p>
          <p className="text-lg font-bold text-indigo-600">₹75L</p>
          <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
            <div className="w-3/5 h-full bg-indigo-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-orange-500">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-lg font-bold text-orange-600">8</p>
          <p className="text-xs text-orange-600">3 in progress</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-1.5 mb-6 inline-flex flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                New Task
              </button>
            </div>

            {showCreateForm ? (
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                    <input 
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={newTask.department}
                      onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Revenue</option>
                      <option>Finance</option>
                      <option>Administration</option>
                      <option>Development</option>
                      <option>Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <DatePicker
                      selected={newTask.dueDate}
                      onChange={(date) => setNewTask({...newTask, dueDate: date})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholderText="Select due date"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                    <input
                      type="text"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter assignee"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={newTask.location}
                      onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    rows="4"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task description"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Click "New Task" button to create a task
              </div>
            )}
          </motion.div>
        )}

        {/* Task Tracking Tab */}
        {activeTab === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option>Revenue</option>
                <option>Finance</option>
                <option>Administration</option>
                <option>Development</option>
                <option>Infrastructure</option>
              </select>
              <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Apply Filters
              </button>
            </div>

            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {task.department === 'Revenue' ? '📋' :
                         task.department === 'Finance' ? '📊' :
                         task.department === 'Administration' ? '📝' :
                         task.department === 'Development' ? '🏗️' : '💧'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {task.assignedTo}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">{task.progress}%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Add Remark">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Forward">
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700">Pending Tasks</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {tasks.filter(t => t.status === 'Pending').length}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-700">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-700">
                  {tasks.filter(t => t.status === 'Overdue').length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-700">Total Pending</p>
                <p className="text-2xl font-bold text-orange-700">
                  {tasks.filter(t => t.status === 'Pending' || t.status === 'Overdue').length}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingTasks.map((task) => {
                    const daysOverdue = task.status === 'Overdue' ? getDaysOverdue(task.dueDate) : 0;
                    return (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.description}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{task.department}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{task.assignedTo}</td>
                        <td className="px-4 py-3">
                          {task.status === 'Overdue' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              {daysOverdue} days
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">Collector Office - Amravati</span>
          <span>•</span>
          <span>Amravati</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></span>
          30°C Sunny
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;
