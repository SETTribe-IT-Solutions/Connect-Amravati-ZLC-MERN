import React, { useState, useRef, useEffect } from 'react';
import { getTasks, createTask, updateTaskStatus, addTaskRemark } from '../../services/taskService';
import { getAllUsers } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircleIcon, ArrowPathIcon, ClockIcon, MagnifyingGlassIcon, FunnelIcon,
  CalendarIcon, UserIcon, PaperClipIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon,
  XMarkIcon, CheckCircleIcon, FlagIcon, EyeIcon, BuildingOfficeIcon, UsersIcon,
  MapPinIcon, DocumentTextIcon, TrashIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TaskDashboard = ({ user }) => {
  const role = user?.role || localStorage.getItem('role') || 'user';
  const roleLower = role.toLowerCase();
  const canCreateTask = ['collector', 'additional collector', 'sdo', 'tehsildar', 'admin'].some(r => roleLower.includes(r));

  const [activeTab, setActiveTab] = useState(canCreateTask ? 'create' : 'tracking');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [pendingStatusFilter, setPendingStatusFilter] = useState('all');
  const fileInputRef = useRef(null);
  
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '', description: '', department: 'Revenue', priority: 'Medium',
    assignedType: 'role', assignedTo: '', dueDate: null, targetType: 'target',
    targetValue: '', location: '', attachments: [], selectedVillage: '', otherAssignedTo: ''
  });

  const showToast = (title, value) => {
    setToast({ title, value });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      if (userID) {
        setLoading(true);
        const data = await getTasks(userID);
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const serverURL = baseURL.replace('/api', '');
        const mapped = (data || []).map(t => ({
          ...t,
          description: t.description || '',
          assignedTo: t.assignedToName || 'N/A',
          status: t.status ? t.status.toString().toUpperCase() : 'PENDING',
          priority: t.priority ? t.priority.toString().toUpperCase() : 'MEDIUM',
          attachments: t.attachment ? [{ name: t.attachment, url: `${serverURL}/uploads/${t.attachment}` }] : []
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

  useEffect(() => {
    fetchTasks();
    if (canCreateTask) fetchStaff();
  }, [user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      const taskData = {
        title: newTask.title, description: newTask.description, department: newTask.department,
        priority: newTask.priority.toUpperCase(), assignedTo: parseInt(newTask.assignedTo),
        requesterId: userID, dueDate: newTask.dueDate ? newTask.dueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        target: newTask.targetType === 'target' ? newTask.targetValue : 'NA', location: newTask.location, progress: 0
      };
      const formData = new FormData();
      formData.append('task', new Blob([JSON.stringify(taskData)], { type: 'application/json' }));
      if (newTask.attachments?.[0]?.file) formData.append('file', newTask.attachments[0].file);
      await createTask(formData);
      fetchTasks();
      setNewTask({ title: '', description: '', department: 'Revenue', priority: 'Medium', assignedType: 'role', assignedTo: '', dueDate: null, targetType: 'target', targetValue: '', location: '', attachments: [], selectedVillage: '', otherAssignedTo: '' });
      setShowCreateForm(false);
      showToast('Task created successfully!', 'success');
    } catch (error) {
      showToast('Failed to create task', 'error');
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
    showToast(`${files.length} file(s) uploaded successfully!`, 'success');
  };

  const handleRemoveAttachment = (index) => {
    const updatedAttachments = newTask.attachments.filter((_, i) => i !== index);
    setNewTask({ ...newTask, attachments: updatedAttachments });
    showToast('Attachment removed', 'info');
  };

  const handleAddRemark = async (taskId, remarkText) => {
    if (!remarkText?.trim()) return showToast('Please enter a remark', 'error');
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      await addTaskRemark(taskId, remarkText, userID);
      fetchTasks();
      showToast('Remark added successfully!', 'success');
    } catch (error) {
      showToast('Failed to add remark', 'error');
    }
  };

  const handleForwardTask = (taskId, forwardTo) => {
    if (!forwardTo?.trim()) {
      showToast('Please enter who to forward to', 'error');
      return;
    }
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, assignedTo: forwardTo }
        : task
    ));
    showToast(`Task forwarded to ${forwardTo} successfully!`, 'success');
  };

  const handleUpdateProgress = async (taskId, newProgress) => {
    const progress = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      if (progress > 0 && progress < 100) await updateTaskStatus(taskId, 'IN_PROGRESS', userID);
      else if (progress === 100) await updateTaskStatus(taskId, 'COMPLETED', userID);
      fetchTasks();
      showToast(`Progress updated to ${progress}%`, 'success');
    } catch (error) {
      showToast('Failed to update progress', 'error');
    }
  };

  const tabs = canCreateTask 
    ? [{ id: 'create', name: 'Create Task', icon: PlusCircleIcon }, 
       { id: 'tracking', name: 'Task Tracking', icon: ArrowPathIcon }, 
       { id: 'pending', name: 'Pending Report', icon: ClockIcon }]
    : [{ id: 'tracking', name: 'Task Tracking', icon: ArrowPathIcon }, 
       { id: 'pending', name: 'Pending Report', icon: ClockIcon }];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus.replace(/\s+/g, '_').toUpperCase();
    const matchesDept = selectedDepartment === 'all' || task.department === selectedDepartment;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const filteredPendingTasks = tasks.filter(t => {
    const isPending = t.status === 'PENDING' || t.status === 'OVERDUE';
    const matchesSearch = pendingSearchTerm === '' ||
      t.title.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(pendingSearchTerm.toLowerCase());
    const matchesStatus = pendingStatusFilter === 'all' || t.status === pendingStatusFilter.toUpperCase();
    return isPending && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const s = status?.toUpperCase() || '';
    if (s === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (s === 'IN_PROGRESS') return 'bg-gray-100 text-gray-700';
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
    if (s === 'OVERDUE') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase() || '';
    if (p === 'HIGH') return 'bg-red-100 text-red-700';
    if (p === 'MEDIUM') return 'bg-amber-100 text-amber-700';
    if (p === 'LOW') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getAssignedIcon = (type) => {
    if (type === 'role') return <UsersIcon className="h-4 w-4" />;
    if (type === 'employee') return <UserIcon className="h-4 w-4" />;
    if (type === 'village') return <MapPinIcon className="h-4 w-4" />;
    return <BuildingOfficeIcon className="h-4 w-4" />;
  };

  const stats = [
    { name: 'Total Tasks', value: tasks.length, icon: DocumentTextIcon, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length, icon: CheckCircleIcon, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: ArrowPathIcon, bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length, icon: ClockIcon, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { name: 'Overdue', value: tasks.filter(t => t.status === 'OVERDUE').length, icon: ExclamationTriangleIcon, bgColor: 'bg-red-50', textColor: 'text-red-600' }
  ];

  const getStatDetails = (statName, value) => {
    let details = '';
    switch(statName) {
      case 'Total Tasks':
        details = `Total tasks: ${value}\nBreakdown:\n- Completed: ${tasks.filter(t => t.status === 'COMPLETED').length}\n- In Progress: ${tasks.filter(t => t.status === 'IN_PROGRESS').length}\n- Pending: ${tasks.filter(t => t.status === 'PENDING').length}\n- Overdue: ${tasks.filter(t => t.status === 'OVERDUE').length}`;
        break;
      case 'Completed':
        details = `Completed tasks: ${value}\nAchievement rate: ${tasks.length ? ((value / tasks.length) * 100).toFixed(1) : 0}%`;
        break;
      case 'In Progress':
        details = `In Progress tasks: ${value}\nTasks currently being worked on.`;
        break;
      case 'Pending':
        details = `Pending tasks: ${value}\nTasks waiting to be started.`;
        break;
      case 'Overdue':
        const overdueTasks = tasks.filter(t => t.status === 'OVERDUE');
        details = `Overdue tasks: ${value}\n\nDetails:\n${overdueTasks.map(t => `- ${t.title} (Due: ${t.dueDate})`).join('\n')}`;
        break;
      default:
        details = `${statName}: ${value}`;
    }
    return details;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 p-3 px-5">
              <DocumentTextIcon className="h-5 w-5 text-white/80" />
              <div><p className="text-sm font-medium">{toast.title}</p><p className="text-lg font-bold">{toast.value}</p></div>
              <button onClick={() => setToast(null)} className="text-white/70 hover:text-white"><XMarkIcon className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Task Management</h2>
          <p className="text-gray-600 mt-1">Create, track and manage all your tasks in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} onClick={() => {
              const details = getStatDetails(stat.name, stat.value);
              setToast({ title: stat.name, value: stat.value });
              setTimeout(() => setToast(null), 3000);
            }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 cursor-pointer">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">{stat.name}</p><p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p></div>
                <div className={`${stat.bgColor} p-2 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.textColor}`} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation - Removed "activated" word */}
        <div className="bg-white rounded-xl shadow-sm p-1.5 mb-6 inline-flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { 
              setActiveTab(tab.id); 
              if (tab.id === 'create') setShowCreateForm(false);
              setToast({ title: tab.name, value: '' });
              setTimeout(() => setToast(null), 2000);
            }}
              className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <tab.icon className="h-4 w-4 mr-2" /> {tab.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Create Task Tab */}
          {activeTab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden">
              {!showCreateForm ? (
                <div className="text-center py-16" onClick={() => setShowCreateForm(true)}>
                  <div className="inline-flex flex-col items-center cursor-pointer">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md mb-4">
                      <PlusCircleIcon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Click to create new task</h3>
                    <p className="text-sm text-gray-500">Create and manage your tasks efficiently</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3"><h2 className="text-lg font-bold text-white">Create New Task</h2></div>
                  <form onSubmit={handleCreateTask} className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                        <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select value={newTask.department} onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"><option>Revenue</option><option>Finance</option><option>Administration</option><option>Development</option><option>Infrastructure</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                        <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"><option>High</option><option>Medium</option><option>Low</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                        <DatePicker selected={newTask.dueDate} onChange={(date) => setNewTask({...newTask, dueDate: date})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholderText="Select due date" required /></div>
                      <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea rows="3" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg" required /></div>
                    </div>
                    
                    {/* Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                      <div className="flex flex-col gap-3">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
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
                                <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-red-500 hover:text-red-700">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg">Create Task</button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          )}

          {/* Task Tracking Tab */}
          {activeTab === 'tracking' && (
            <motion.div key="tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden p-5">
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px]"><MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search tasks..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option><option value="IN_PROGRESS">In Progress</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option><option value="OVERDUE">Overdue</option>
                </select>
                <button onClick={() => { setSearchTerm(''); setSelectedStatus('all'); setSelectedDepartment('all'); }} 
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700">Reset</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TASK</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">PRIORITY</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">STATUS</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ASSIGNED TO</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">DUE DATE</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TARGET</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ACHIEVEMENT</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ATTACHMENTS</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2"><p className="font-semibold text-gray-800 text-sm">{task.title}</p><p className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</p></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>{task.status}</span></td>
                        <td className="px-3 py-2 text-sm text-gray-600">{task.assignedTo}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{task.target || 'NA'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{task.achievement || 'Not Started'}</td>
                        <td className="px-3 py-2">
                          {task.attachments.length > 0 ? (
                            <a href={task.attachments[0].url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                              <PaperClipIcon className="h-4 w-4" />
                            </a>
                          ) : (<span className="text-gray-400">-</span>)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedTask(task); setShowDetailsModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View Details"><EyeIcon className="h-4 w-4" /></button>
                            <button onClick={() => { const remark = prompt('Enter remark:'); if (remark) handleAddRemark(task.id, remark); }} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Add Remark"><ChatBubbleLeftRightIcon className="h-4 w-4" /></button>
                            <button onClick={() => { const forwardTo = prompt('Forward to (name/role):'); if (forwardTo) handleForwardTask(task.id, forwardTo); }} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Forward"><PaperAirplaneIcon className="h-4 w-4" /></button>
                            <button onClick={() => { const progress = prompt('Update progress (0-100):', task.progress || 0); if (progress) handleUpdateProgress(task.id, progress); }} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Update Progress"><ArrowPathIcon className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No tasks found matching your search</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Pending Report Tab - Added dropdown filter */}
          {activeTab === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm p-5">
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div onClick={() => setPendingStatusFilter('PENDING')} className={`p-3 rounded-lg cursor-pointer text-center ${pendingStatusFilter === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700'}`}>
                  <p className="text-sm">Pending</p><p className="text-xl font-bold">{tasks.filter(t => t.status === 'PENDING').length}</p>
                </div>
                <div onClick={() => setPendingStatusFilter('OVERDUE')} className={`p-3 rounded-lg cursor-pointer text-center ${pendingStatusFilter === 'OVERDUE' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700'}`}>
                  <p className="text-sm">Overdue</p><p className="text-xl font-bold">{tasks.filter(t => t.status === 'OVERDUE').length}</p>
                </div>
              </div>
              
              {/* Search and Filter Dropdown */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search pending tasks..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg" value={pendingSearchTerm} onChange={(e) => setPendingSearchTerm(e.target.value)} />
                </div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg" value={pendingStatusFilter} onChange={(e) => setPendingStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Task</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Assigned To</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPendingTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2"><p className="font-semibold text-gray-800 text-sm">{task.title}</p></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                        <td className="px-3 py-2 text-sm text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{task.assignedTo}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>{task.status}</span></td>
                        <td className="px-3 py-2"><button onClick={() => { setSelectedTask(task); setShowDetailsModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><EyeIcon className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Details Modal - Added all icons */}
      <AnimatePresence>
        {showDetailsModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-[450px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Task Details</h3>
                  <button onClick={() => setShowCloseConfirm(true)} className="hover:bg-white/20 p-1 rounded"><XMarkIcon className="h-4 w-4" /></button>
                </div>
                <div className="flex gap-2 text-xs text-white/80 mt-1">
                  <div className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> Created By: {selectedTask.createdBy || user?.name || 'Admin'}</div>
                  <div className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Created on: {selectedTask.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div><p className="text-[11px] text-gray-500 flex items-center gap-1"><DocumentTextIcon className="h-3 w-3" /> Task Title</p><p className="text-sm font-semibold text-gray-800">{selectedTask.title}</p></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><UsersIcon className="h-3 w-3" /> Assigned To</p><p className="text-xs font-medium">{selectedTask.assignedToName || 'Admin'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><FlagIcon className="h-3 w-3" /> Priority</p><p className={`text-xs font-semibold ${selectedTask.priority === 'HIGH' ? 'text-red-600' : selectedTask.priority === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'}`}>{selectedTask.priority || 'MEDIUM'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Due Date</p><p className="text-xs font-medium">{selectedTask.dueDate || 'Not set'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><CheckCircleIcon className="h-3 w-3" /> Status</p><p className={`text-xs font-semibold ${selectedTask.status === 'COMPLETED' ? 'text-green-600' : selectedTask.status === 'IN_PROGRESS' ? 'text-gray-600' : 'text-amber-600'}`}>{selectedTask.status || 'PENDING'}</p></div>
                </div>
                {selectedTask.description && (<div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Description</p><p className="text-xs text-gray-600">{selectedTask.description}</p></div>)}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><FlagIcon className="h-3 w-3" /> Target</p><p className="text-xs font-medium">{selectedTask.target || '100'}%</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Progress</p><div className="flex items-center gap-1"><div className="flex-1 h-1 bg-gray-200 rounded-full"><div className="h-1 bg-green-500 rounded-full" style={{ width: `${selectedTask.progress || 0}%` }}></div></div><span className="text-[11px] font-medium">{selectedTask.progress || 0}%</span></div></div>
                </div>
                <div className="bg-blue-50 p-2 rounded"><p className="text-[10px] text-blue-600 flex items-center gap-1"><CheckCircleIcon className="h-3 w-3" /> Achievement</p><p className="text-xs text-gray-700">{selectedTask.achievement || 'Not Started'}</p></div>
                <button onClick={() => setShowCloseConfirm(true)} className="w-full py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all text-xs font-medium">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close Confirmation Modal */}
      <AnimatePresence>
        {showCloseConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCloseConfirm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-xs w-full p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Close Task Details?</h3>
              <p className="text-xs text-gray-500 mb-3">Are you sure you want to close?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowCloseConfirm(false)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setShowCloseConfirm(false); setShowDetailsModal(false); }} className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Yes, Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskDashboard;