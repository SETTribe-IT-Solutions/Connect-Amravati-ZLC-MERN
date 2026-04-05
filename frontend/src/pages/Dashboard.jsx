import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getTasks } from '../services/taskService';
import {
  ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon,
  ExclamationTriangleIcon, ArrowPathIcon, EyeIcon, XMarkIcon,
  CalendarIcon, UserIcon, FlagIcon,
  ChartBarIcon, UserGroupIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = user?.userID || localStorage.getItem('userID');
        if (userID) {
          const stats = await getDashboardStats(userID);
          setDashboardData(stats);
          const tasks = await getTasks(userID);
          setRecentTasks(tasks.slice(0, 5));
          
          // Simulate chart data based on selected period
          if (selectedPeriod === 'week') {
            setChartData([
              { name: 'Mon', tasks: stats.totalTasks || 0, completed: stats.completed || 0, inProgress: stats.inProgress || 0, pending: stats.pending || 0, overdue: stats.overdue || 0 },
              { name: 'Tue', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
              { name: 'Wed', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
              { name: 'Thu', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
              { name: 'Fri', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
              { name: 'Sat', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
              { name: 'Sun', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
            ]);
          } else if (selectedPeriod === 'month') {
            setChartData([
              { name: 'Week 1', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Week 2', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Week 3', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Week 4', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
            ]);
          } else if (selectedPeriod === 'quarter') {
            setChartData([
              { name: 'Jan', tasks: Math.floor(stats.totalTasks / 3) || 0, completed: Math.floor(stats.completed / 3) || 0, inProgress: Math.floor(stats.inProgress / 3) || 0, pending: Math.floor(stats.pending / 3) || 0, overdue: Math.floor(stats.overdue / 3) || 0 },
              { name: 'Feb', tasks: Math.floor(stats.totalTasks / 3) || 0, completed: Math.floor(stats.completed / 3) || 0, inProgress: Math.floor(stats.inProgress / 3) || 0, pending: Math.floor(stats.pending / 3) || 0, overdue: Math.floor(stats.overdue / 3) || 0 },
              { name: 'Mar', tasks: Math.floor(stats.totalTasks / 3) || 0, completed: Math.floor(stats.completed / 3) || 0, inProgress: Math.floor(stats.inProgress / 3) || 0, pending: Math.floor(stats.pending / 3) || 0, overdue: Math.floor(stats.overdue / 3) || 0 },
            ]);
          } else if (selectedPeriod === 'year') {
            setChartData([
              { name: 'Q1', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Q2', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Q3', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Q4', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
            ]);
          }
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        setChartData([
          { name: 'Mon', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
          { name: 'Tue', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
          { name: 'Wed', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
          { name: 'Thu', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
          { name: 'Fri', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
          { name: 'Sat', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
          { name: 'Sun', tasks: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
        ]);
      }
    };
    fetchData();
  }, [user, selectedPeriod]);

  const showToast = (title, value) => {
    setToast({ title, value });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = [
    { name: 'Total Tasks', value: dashboardData.totalTasks, icon: ClipboardDocumentListIcon, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { name: 'Completed', value: dashboardData.completed, icon: CheckCircleIcon, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { name: 'In Progress', value: dashboardData.inProgress, icon: ArrowPathIcon, bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
    { name: 'Pending', value: dashboardData.pending, icon: ClockIcon, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { name: 'Overdue', value: dashboardData.overdue, icon: ExclamationTriangleIcon, bgColor: 'bg-red-50', textColor: 'text-red-600' }
  ];

  const taskDistribution = [
    { name: 'Completed', value: dashboardData.completed, color: '#10b981' },
    { name: 'In Progress', value: dashboardData.inProgress, color: '#6b7280' },
    { name: 'Pending', value: dashboardData.pending, color: '#f59e0b' },
    { name: 'Overdue', value: dashboardData.overdue, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const handleViewAll = () => {
    navigate('/tasks');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-800 mt-1">Welcome, {user?.name || 'Collector Office'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} onClick={() => showToast(stat.name, stat.value)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 cursor-pointer">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-800">{stat.name}</p><p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p></div>
              <div className={`${stat.bgColor} p-2 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.textColor}`} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Dynamic Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              {selectedPeriod === 'week' ? 'Weekly' : selectedPeriod === 'month' ? 'Monthly' : selectedPeriod === 'quarter' ? 'Quarterly' : 'Yearly'} Task Overview
            </h2>
            <select className="text-xs border rounded-md px-2 py-1" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="tasks" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#6b7280" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Task Distribution</h2>
          <p className="text-xs text-gray-800 mb-3">Current status breakdown ({dashboardData.totalTasks} total tasks)</p>
          <div className="h-64">
            {taskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {taskDistribution.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-gray-400">No tasks available</div>)}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Recent Activities</h2>
          <button onClick={handleViewAll} className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">View All</button>
        </div>
        <div className="space-y-2">
          {recentTasks.length > 0 ? recentTasks.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <div className="flex-1"><p className="text-sm font-medium text-gray-800">{activity.title}</p><p className="text-xs text-gray-800">To: {activity.assignedToName} • {activity.status}</p></div>
              <button onClick={() => { setSelectedTask(activity); setShowDetailsModal(true); }} 
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md opacity-70 group-hover:opacity-100 transition-opacity">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          )) : (<div className="text-center py-6 text-gray-400 text-sm">No recent tasks</div>)}
        </div>
      </div>

      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 p-3 px-5">
              <ClipboardDocumentListIcon className="h-5 w-5 text-white/80" />
              <div><p className="text-sm font-medium">{toast.title}</p><p className="text-lg font-bold">{toast.value}</p></div>
              <button onClick={() => setToast(null)} className="text-white/70 hover:text-white"><XMarkIcon className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-[450px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
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
              
              {/* Body */}
              <div className="p-3 space-y-2">
                <div><p className="text-[11px] text-gray-500 flex items-center gap-1"><DocumentTextIcon className="h-3 w-3" /> Task Title</p><p className="text-sm font-semibold text-gray-800">{selectedTask.title}</p></div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><UserGroupIcon className="h-3 w-3" /> Assigned To</p><p className="text-xs font-medium">{selectedTask.assignedToName || 'Admin User'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><FlagIcon className="h-3 w-3" /> Priority</p><p className={`text-xs font-semibold ${selectedTask.priority === 'HIGH' ? 'text-red-600' : selectedTask.priority === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'}`}>{selectedTask.priority || 'MEDIUM'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Due Date</p><p className="text-xs font-medium">{selectedTask.dueDate || 'Not set'}</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500 flex items-center gap-1"><ChartBarIcon className="h-3 w-3" /> Status</p><p className={`text-xs font-semibold ${selectedTask.status === 'COMPLETED' ? 'text-green-600' : selectedTask.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-amber-600'}`}>{selectedTask.status || 'PENDING'}</p></div>
                </div>
                
                {selectedTask.description && (
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Description</p><p className="text-xs text-gray-600">{selectedTask.description}</p></div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Target</p><p className="text-xs font-medium">{selectedTask.target || '100'}%</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-[10px] text-gray-500">Progress</p><div className="flex items-center gap-1"><div className="flex-1 h-1 bg-gray-200 rounded-full"><div className="h-1 bg-green-500 rounded-full" style={{ width: `${selectedTask.progress || 0}%` }}></div></div><span className="text-[11px] font-medium">{selectedTask.progress || 0}%</span></div></div>
                </div>
                
                <div className="bg-blue-50 p-2 rounded"><p className="text-[10px] text-blue-600 flex items-center gap-1"><CheckCircleIcon className="h-3 w-3" /> Achievement</p><p className="text-xs text-gray-700">{selectedTask.achievement || 'Not Started'}</p></div>
                
                <button onClick={() => setShowCloseConfirm(true)} className="w-full py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all text-xs font-medium">
                  Close
                </button>
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

export default Dashboard;