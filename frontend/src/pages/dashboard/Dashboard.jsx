import React, { useState } from 'react';
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
<<<<<<< HEAD
=======
  TrophyIcon,
>>>>>>> upstream/main
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

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Updated stats with new metrics
  const stats = [
    {
      name: 'Total Tasks',
      value: '156',
      icon: ClipboardDocumentListIcon,
      change: '+12%',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Completed',
      value: '98',
      icon: CheckCircleIcon,
      change: '+8%',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'In Progress',
      value: '42',
      icon: ArrowPathIcon,
      change: '-3%',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Overdue',
      value: '16',
      icon: ExclamationTriangleIcon,
      change: '+5%',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
<<<<<<< HEAD
=======
      name: 'Total Achievement',
      value: '₹ 45.2L',
      icon: TrophyIcon,
      change: '+15%',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
>>>>>>> upstream/main
      name: 'Total Target',
      value: '₹ 75L',
      icon: FlagIcon,
      change: '60% achieved',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      name: 'Pending Features',
      value: '8',
      icon: ClockIcon,
      change: '3 in progress',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  const taskDistribution = [
    { name: 'Completed', value: 98, color: '#10b981' },
    { name: 'In Progress', value: 42, color: '#f59e0b' },
    { name: 'Pending', value: 28, color: '#6b7280' },
    { name: 'Overdue', value: 16, color: '#ef4444' },
  ];

  const weeklyTasks = [
    { day: 'Mon', tasks: 12, completed: 8 },
    { day: 'Tue', tasks: 15, completed: 12 },
    { day: 'Wed', tasks: 18, completed: 14 },
    { day: 'Thu', tasks: 14, completed: 11 },
    { day: 'Fri', tasks: 20, completed: 16 },
    { day: 'Sat', tasks: 10, completed: 7 },
    { day: 'Sun', tasks: 5, completed: 4 },
  ];

  const recentActivities = [
    { id: 1, user: 'Collector Office', action: 'New task assigned', target: 'Land Survey', time: '5 min ago', priority: 'High' },
    { id: 2, user: 'Tehsildar', action: 'Task completed', target: 'Revenue Collection', time: '15 min ago', priority: 'Normal' },
    { id: 3, user: 'SDO', action: 'Task overdue', target: 'Infrastructure Report', time: '1 hour ago', priority: 'Urgent' },
    { id: 4, user: 'BDO', action: 'New appreciation', target: 'Gram Sevak', time: '2 hours ago', priority: 'Normal' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
          Welcome back, Collector Office - Amravati
        </p>
      </div>

      {/* Stats Grid - Updated to 7 cards */}
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
                <p className={`text-xs mt-2 flex items-center gap-1 ${stat.change.includes('+') ? 'text-green-600' :
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
                  <div className="h-full w-3/5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            )}

<<<<<<< HEAD
=======
            {/* Achievement badge */}
            {stat.name === 'Total Achievement' && (
              <div className="mt-3 flex items-center gap-1">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Above target
                </span>
              </div>
            )}
>>>>>>> upstream/main
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
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${activity.priority === 'High' ? 'bg-yellow-500' :
                    activity.priority === 'Urgent' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">
                    {activity.action}: <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{activity.time}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${activity.priority === 'High' ? 'bg-yellow-100 text-yellow-800' :
                    activity.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                  {activity.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;