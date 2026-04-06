import React, { useState, useRef, useEffect } from 'react';
import { getTasks, createTask, updateTaskStatus, addTaskRemark, updateTaskProgressAPI, forwardTaskAPI } from '../../services/taskService';
import { getAllUsers, getSubordinates } from '../../services/userService';
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
  
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [subordinates, setSubordinates] = useState([]);
  const [forwardLoading, setForwardLoading] = useState(false);
  const [selectedTaskForForward, setSelectedTaskForForward] = useState(null);
  
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
          attachments: t.attachment ? [{ name: t.attachment, url: `${serverURL}/uploads/${t.attachment}` }] : [],
          remarks: t.remarks || []
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
      // Filter out self
      const filteredStaff = (data || []).filter(u => u.userID.toString() !== requesterId.toString());
      setStaff(filteredStaff);
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
      const assignedToId = parseInt(newTask.assignedTo);
      
      if (assignedToId === parseInt(userID)) {
        showToast('You cannot assign a task to yourself', 'error');
        return;
      }

      const taskData = {
        title: newTask.title, description: newTask.description, department: newTask.department,
        priority: newTask.priority.toUpperCase(), assignedTo: parseInt(newTask.assignedTo),
        requesterId: userID, 
        dueDate: newTask.dueDate ? new Date(newTask.dueDate.getTime() - newTask.dueDate.getTimezoneOffset() * 60000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
      console.error("Create Task Error:", error);
      const msg = error.response?.data?.message || error.message || 'Failed to create task';
      showToast(msg, 'error');
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
      await fetchTasks();
      showToast('Remark added successfully!', 'success');
    } catch (error) {
      showToast('Failed to add remark', 'error');
    }
  };

  const handleOpenForwardModal = async (task) => {
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      setForwardLoading(true);
      const data = await getSubordinates(userID);
      // Filter out self
      const filteredSubordinates = (data || []).filter(sub => sub.userID.toString() !== userID.toString());
      setSubordinates(filteredSubordinates);
      setSelectedTaskForForward(task);
      setIsForwardModalOpen(true);
    } catch (error) {
      showToast('Failed to fetch subordinates', 'error');
    } finally {
      setForwardLoading(false);
    }
  };

  const handleConfirmForward = async (targetUserId) => {
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      
      if (parseInt(targetUserId) === parseInt(userID)) {
        showToast('You cannot forward a task to yourself', 'error');
        return;
      }

      await forwardTaskAPI(selectedTaskForForward.id, targetUserId, userID);
      setIsForwardModalOpen(false);
      fetchTasks();
      showToast('Task forwarded successfully!', 'success');
    } catch (error) {
      showToast('Failed to forward task', 'error');
    }
  };

  const handleUpdateProgress = async (taskId, achieved) => {
    try {
      const userID = user?.userID || localStorage.getItem('userID');
      await updateTaskProgressAPI(taskId, parseInt(achieved), userID);
      fetchTasks();
      showToast(`Achievement updated to ${achieved}`, 'success');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-blue-600 text-white rounded-lg shadow-lg">
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
            <div key={stat.name} onClick={() => setToast({ title: stat.name, value: stat.value })}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 cursor-pointer">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">{stat.name}</p><p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p></div>
                <div className={`${stat.bgColor} p-2 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.textColor}`} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-1.5 mb-6 inline-flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'create') setShowCreateForm(false); }}
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
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholderText="Select due date" 
                          minDate={new Date()} required /></div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div className="relative">
                          <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input type="text" value={newTask.location} onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter location" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Allocate To Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Allocate To *</label>
                      <div className="flex flex-wrap gap-6 mb-4">
                        {['role', 'employee', 'village', 'other'].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="assignedType" value={type} checked={newTask.assignedType === type}
                              onChange={(e) => setNewTask({...newTask, assignedType: e.target.value, assignedTo: ''})}
                              className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 capitalize">{type === 'other' ? 'Other' : type}</span>
                          </label>
                        ))}
                      </div>
                      
                      {newTask.assignedType === 'role' && (
                        <select value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                          <option value="">Select Staff Member</option>
                          {staff.filter(u => u.role !== 'SYSTEM_ADMINISTRATOR').map(u => (
                            <option key={u.userID} value={u.userID}>{u.name} ({u.role?.replace(/_/g, ' ')})</option>
                          ))}
                        </select>
                      )}
                      
                      {newTask.assignedType === 'employee' && (
                        <select value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                          <option value="">Select Specific Officer</option>
                          {staff.map(u => <option key={u.userID} value={u.userID}>{u.name} - {u.role?.replace(/_/g, ' ')}</option>)}
                        </select>
                      )}

                      {newTask.assignedType === 'village' && (
                        <div className="space-y-3">
                          <select value={newTask.selectedVillage} onChange={(e) => setNewTask({...newTask, selectedVillage: e.target.value, assignedTo: ''})}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select Village</option>
                            {[...new Set(staff.map(u => u.village).filter(Boolean))].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                          {newTask.selectedVillage && (
                            <select value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                              <option value="">Select Officer in {newTask.selectedVillage}</option>
                              {staff.filter(u => u.village === newTask.selectedVillage).map(u => (
                                <option key={u.userID} value={u.userID}>{u.name} - {u.role?.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {newTask.assignedType === 'other' && (
                        <div className="space-y-3">
                          <input type="text" value={newTask.otherAssignedTo} onChange={(e) => {
                            const val = e.target.value;
                            const found = staff.find(u => u.name.toLowerCase() === val.toLowerCase());
                            setNewTask({...newTask, otherAssignedTo: val, assignedTo: found ? found.userID : val});
                          }} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter name or ID manually..." required />
                        </div>
                      )}
                    </div>
                    
                    {/* Target Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target *</label>
                      <div className="flex gap-6 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="targetType" value="target" checked={newTask.targetType === 'target'}
                            onChange={(e) => setNewTask({...newTask, targetType: e.target.value})} className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Target</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="targetType" value="na" checked={newTask.targetType === 'na'}
                            onChange={(e) => setNewTask({...newTask, targetType: e.target.value, targetValue: 'NA'})} className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">NA</span>
                        </label>
                      </div>
                      {newTask.targetType === 'target' && (
                        <input type="text" value={newTask.targetValue} onChange={(e) => setNewTask({...newTask, targetValue: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter target value" required />
                      )}
                      {newTask.targetType === 'na' && (
                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-500 text-sm">Target set to NA</div>
                      )}
                    </div>
                    
                    {/* Description - Last */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea rows="3" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    
                    {/* Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                        <PaperClipIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload files</span>
                      </button>
                      {newTask.attachments.length > 0 && newTask.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mt-2">
                          <div className="flex items-center gap-2"><PaperClipIcon className="h-4 w-4 text-gray-500" /><span className="text-sm text-gray-600">{file.name}</span><span className="text-xs text-gray-400">({file.size})</span></div>
                          <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                      ))}
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
                <div className="relative flex-1"><MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search tasks..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option><option value="IN_PROGRESS">In Progress</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option><option value="OVERDUE">Overdue</option>
                </select>
                <button onClick={() => { setSearchTerm(''); setSelectedStatus('all'); }} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Reset</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">TASK</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">PRIORITY</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">STATUS</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">ASSIGNED TO</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">DUE DATE</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">TARGET</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">ACHIEVEMENT</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">ATTACHMENTS</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">REMARKS</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">ACTIONS</th></tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2"><p className="font-semibold text-gray-800 text-sm">{task.title}</p></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>{task.status}</span></td>
                        <td className="px-3 py-2 text-sm text-gray-600">{task.assignedTo}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{task.target || 'NA'}</td>
                        <td className="px-3 py-2"><div>{task.achievement || 0}</div><div className="text-[10px] text-blue-500">{task.progress || 0}%</div></td>
                        <td className="px-3 py-2">{task.attachments.length > 0 ? <a href={task.attachments[0].url} target="_blank" className="text-blue-600"><PaperClipIcon className="h-4 w-4" /></a> : '-'}</td>
                        <td className="px-3 py-2">{task.remarks?.length > 0 ? <span className="text-xs text-gray-500">{task.remarks.length} remark(s)</span> : '-'}</td>
                        <td className="px-3 py-2"><div className="flex gap-2">
                          <button onClick={() => { setSelectedTask(task); setShowDetailsModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><EyeIcon className="h-4 w-4" /></button>
                          <button onClick={() => { const remark = prompt('Enter remark:'); if (remark) handleAddRemark(task.id, remark); }} className="p-1 text-green-600 hover:bg-green-50 rounded"><ChatBubbleLeftRightIcon className="h-4 w-4" /></button>
                          <button onClick={() => handleOpenForwardModal(task)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><PaperAirplaneIcon className="h-4 w-4" /></button>
                          <button onClick={() => { const val = prompt(`Update Achievement:`, task.achievement || 0); if (val) handleUpdateProgress(task.id, val); }} className="p-1 text-purple-600 hover:bg-purple-50 rounded"><ArrowPathIcon className="h-4 w-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTasks.length === 0 && <div className="text-center py-8 text-gray-500">No tasks found</div>}
              </div>
            </motion.div>
          )}

          {/* Pending Report Tab */}
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
              
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1"><MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search pending tasks..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg" value={pendingSearchTerm} onChange={(e) => setPendingSearchTerm(e.target.value)} /></div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg" value={pendingStatusFilter} onChange={(e) => setPendingStatusFilter(e.target.value)}>
                  <option value="all">All Status</option><option value="PENDING">Pending</option><option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Task</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Priority</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Due Date</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Assigned To</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Actions</th></tr></thead>
                  <tbody>
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

      {/* Task Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setShowDetailsModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-[500px] max-w-[90vw] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white rounded-t-xl sticky top-0">
                <div className="flex justify-between"><h3 className="text-sm font-semibold">Task Details</h3><button onClick={() => setShowCloseConfirm(true)}><XMarkIcon className="h-4 w-4" /></button></div>
                <div className="flex gap-2 text-xs mt-1"><div className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> Created By: {selectedTask.createdBy || user?.name || 'Admin'}</div><div className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Created on: {selectedTask.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}</div></div>
              </div>
              <div className="p-4 space-y-3">
                <div><p className="text-[11px] text-gray-500">Task Title</p><p className="text-sm font-semibold text-gray-800">{selectedTask.title}</p></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Assigned To</p><p className="text-xs font-medium">{selectedTask.assignedToName || 'Admin'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Priority</p><p className={`text-xs font-semibold ${selectedTask.priority === 'HIGH' ? 'text-red-600' : selectedTask.priority === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'}`}>{selectedTask.priority || 'MEDIUM'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Due Date</p><p className="text-xs font-medium">{selectedTask.dueDate || 'Not set'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Status</p><p className={`text-xs font-semibold ${selectedTask.status === 'COMPLETED' ? 'text-green-600' : selectedTask.status === 'IN_PROGRESS' ? 'text-gray-600' : 'text-amber-600'}`}>{selectedTask.status || 'PENDING'}</p></div>
                </div>
                {selectedTask.description && <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Description</p><p className="text-xs text-gray-600">{selectedTask.description}</p></div>}
                {selectedTask.location && <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Location</p><p className="text-xs text-gray-600">{selectedTask.location}</p></div>}
                
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Attachments</p>
                  {selectedTask.attachments?.length > 0 ? selectedTask.attachments.map((att, idx) => (
                    <a key={idx} href={att.url} target="_blank" className="text-xs text-blue-600 flex items-center gap-1"><PaperClipIcon className="h-3 w-3" /> {att.name}</a>
                  )) : <p className="text-xs text-gray-400">No attachments</p>}
                </div>
                
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-500">Remarks</p>
                  {selectedTask.remarks?.length > 0 ? selectedTask.remarks.map((remark, idx) => (
                    <div key={idx} className="text-xs text-gray-600 bg-white p-1.5 rounded border mt-1">{remark.remark || remark}</div>
                  )) : <p className="text-xs text-gray-400">No remarks</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Target</p><p className="text-xs font-medium">{selectedTask.target || '100'}%</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Progress</p><div className="flex items-center gap-1"><div className="flex-1 h-1 bg-gray-200 rounded-full"><div className="h-1 bg-green-500 rounded-full" style={{ width: `${selectedTask.progress || 0}%` }}></div></div><span className="text-[11px] font-medium">{selectedTask.progress || 0}%</span></div></div>
                </div>
                <div className="bg-blue-50 p-2 rounded"><p className="text-[10px] text-blue-600">Achievement</p><p className="text-sm font-bold text-gray-800">{selectedTask.achievement || 0}</p></div>
                <button onClick={() => setShowCloseConfirm(true)} className="w-full py-1.5 bg-gray-100 rounded-lg hover:bg-red-100 hover:text-red-600 text-xs">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close Confirmation Modal */}
      <AnimatePresence>
        {showCloseConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setShowCloseConfirm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-xs w-full p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><ExclamationTriangleIcon className="h-5 w-5 text-red-600" /></div>
              <h3 className="text-sm font-semibold mb-1">Close Task Details?</h3>
              <p className="text-xs text-gray-500 mb-3">Are you sure you want to close?</p>
              <div className="flex gap-2"><button onClick={() => setShowCloseConfirm(false)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs">Cancel</button><button onClick={() => { setShowCloseConfirm(false); setShowDetailsModal(false); }} className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs">Yes, Close</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forward Task Modal */}
      <AnimatePresence>
        {isForwardModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[210] p-4" onClick={() => setIsForwardModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                <div className="flex justify-between"><div><h3 className="font-bold flex items-center gap-2"><PaperAirplaneIcon className="h-5 w-5" /> Forward Task</h3><p className="text-emerald-100 text-xs">Select a subordinate to delegate this task</p></div><button onClick={() => setIsForwardModalOpen(false)} className="bg-white/20 p-1 rounded-full"><XMarkIcon className="h-4 w-4" /></button></div>
              </div>
              <div className="p-4">
                <div className="mb-3"><p className="text-[10px] font-semibold text-gray-400">Task to Forward</p><div className="bg-gray-50 rounded-lg p-2"><p className="text-xs font-bold">{selectedTaskForForward?.title}</p></div></div>
                <p className="text-[10px] font-semibold text-gray-400 mb-2">Select Recipient</p>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {forwardLoading ? <div className="text-center py-8">Loading...</div> : subordinates.length > 0 ? subordinates.map((sub) => (
                    <div key={sub.userID} onClick={() => handleConfirmForward(sub.userID)} className="flex items-center justify-between p-2 rounded-lg border hover:border-emerald-200 hover:bg-emerald-50 cursor-pointer">
                      <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">{sub.name.charAt(0)}</div><div><p className="text-xs font-bold">{sub.name}</p><p className="text-[9px] text-gray-500">{sub.role}</p></div></div>
                      <PaperAirplaneIcon className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100" />
                    </div>
                  )) : <div className="text-center py-8 text-gray-500">No subordinates found</div>}
                </div>
              </div>
              <div className="bg-gray-50 p-3 border-t flex justify-end"><button onClick={() => setIsForwardModalOpen(false)} className="px-4 py-1.5 text-xs text-gray-600">Cancel</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskDashboard;