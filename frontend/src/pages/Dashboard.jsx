import React, { useState, useEffect } from 'react';
import { getDashboardStats, getTasks } from '../services/taskService';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrophyIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const Dashboard = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = user?.userID || localStorage.getItem('userID');
        if (userID) {
          const stats = await getDashboardStats(userID);
          setDashboardData(stats);
          
          const tasks = await getTasks(userID);
          setRecentTasks(tasks.slice(0, 5)); // Get last 5 tasks for recent activity
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Updated stats with new metrics
  // Improved stats mapping with safety
  const stats = [
    { 
      name: 'Total Tasks', 
      value: (dashboardData?.totalTasks || 0).toString(), 
      icon: ClipboardDocumentListIcon, 
      change: '+0%', 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      name: 'Completed', 
      value: (dashboardData?.completed || 0).toString(), 
      icon: CheckCircleIcon, 
      change: '0%', 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      name: 'In Progress', 
      value: (dashboardData?.inProgress || 0).toString(), 
      icon: ArrowPathIcon, 
      change: '0%', 
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      name: 'Overdue', 
      value: (dashboardData?.overdue || 0).toString(), 
      icon: ExclamationTriangleIcon, 
      change: '0%', 
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const taskDistribution = [
    { name: 'Completed', value: dashboardData.completed, color: '#10b981' },
    { name: 'In Progress', value: dashboardData.inProgress, color: '#f59e0b' },
    { name: 'Pending', value: dashboardData.pending, color: '#6b7280' },
    { name: 'Overdue', value: dashboardData.overdue, color: '#ef4444' },
  ];

  const weeklyTasks = [];
  const recentActivities = [];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
          Welcome back, {user?.name || 'Collector Office - Amravati'}
        </p>
      </div>

      {/* Stats Grid - Updated to 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-xs mt-2 flex items-center gap-1 ${
                  stat.change.includes('+') ? 'text-green-600' : 
                  stat.change.includes('-') ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  <span>{stat.change.includes('+') ? '↑' : stat.change.includes('-') ? '↓' : '→'}</span>
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
            
            {/* Mini progress bar for Target */}
            {stat.name === 'Total Target' && (
              <div className="mt-4">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            )}
            
            {/* Achievement badge */}
            {stat.name === 'Total Achievement' && (
              <div className="mt-3 flex items-center gap-1">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Section - Keep existing charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Task Overview</h2>
            <select 
              className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTasks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" name="Total Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
        <div className="space-y-4">
          {recentTasks.length > 0 ? recentTasks.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.priority === 'HIGH' ? 'bg-red-500' :
                  activity.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">
                    Assigned to: <span className="font-medium">{activity.assignedToName}</span> | Status: <span className="font-medium">{activity.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{activity.dueDate}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                  activity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {activity.priority}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">No recent tasks found</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;