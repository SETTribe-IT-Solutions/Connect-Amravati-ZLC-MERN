import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PresentationChartLineIcon,
  TableCellsIcon
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
  LineChart,
  Line
} from 'recharts';

import { getPerformanceReport, getGlobalStats } from '../../services/reportService';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReportsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [performanceData, setPerformanceData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const requesterId = localStorage.getItem('userID');
        if (requesterId) {
          const [perf, global] = await Promise.all([
            getPerformanceReport(requesterId),
            getGlobalStats(requesterId)
          ]);
          setPerformanceData(perf || []);
          setGlobalStats(global);
        }
      } catch (error) {
        console.error("Fetch Reports Error:", error);
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Use performance data for department-level information or fallback to empty
  const departmentData = performanceData.length > 0 
    ? performanceData.map(p => ({
        name: p.userName,
        completed: p.completedTasks,
        pending: p.totalTasks - p.completedTasks,
        overdue: p.overdueTasks,
        total: p.totalTasks
      }))
    : [];

  const taskDistribution = globalStats ? [
    { name: 'Completed', value: globalStats.completed || 0, color: '#10B981' },
    { name: 'In Progress', value: globalStats.inProgress || 0, color: '#F59E0B' },
    { name: 'Pending', value: globalStats.pending || 0, color: '#6B7280' },
    { name: 'Overdue', value: globalStats.overdue || 0, color: '#EF4444' },
  ] : [];

  // Currently trends data is not fetched separately, we can derive a mock-free structure
  const monthlyData = []; 
  const weeklyData = [];

  const stats = [
    { 
      title: 'Total Tasks', 
      value: globalStats?.total?.toString() || '0', 
      change: '', 
      icon: DocumentTextIcon, 
      bgColor: 'bg-blue-50', 
      textColor: 'text-blue-600' 
    },
    { 
      title: 'Completion Rate', 
      value: globalStats ? `${globalStats.completionRate}%` : '0%', 
      change: '', 
      icon: CheckCircleIcon, 
      bgColor: 'bg-green-50', 
      textColor: 'text-green-600' 
    },
    { 
      title: 'Pending Tasks', 
      value: globalStats?.pending?.toString() || '0', 
      change: '', 
      icon: ClockIcon, 
      bgColor: 'bg-yellow-50', 
      textColor: 'text-yellow-600' 
    },
    { 
      title: 'Overdue', 
      value: globalStats?.overdue?.toString() || '0', 
      change: '', 
      icon: ExclamationTriangleIcon, 
      bgColor: 'bg-red-50', 
      textColor: 'text-red-600' 
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    try {
      if (!performanceData || performanceData.length === 0) {
        toast.error("No data available to export");
        return;
      }

      // Format data for Excel
      const exportData = performanceData.map(item => ({
        'User Name': item.userName,
        'Role': item.role?.replace(/_/g, ' ') || 'N/A',
        'Total Tasks': item.totalTasks,
        'Completed Tasks': item.completedTasks,
        'Pending Tasks': item.totalTasks - item.completedTasks,
        'Overdue Tasks': item.overdueTasks,
        'Efficiency (%)': item.efficiency,
        'In-Time (%)': item.inTimeCompletion,
        'Delayed (%)': item.delayedCompletion
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Add styling/headers if needed (basic)
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Report");

      // Generate Excel file and trigger download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      const fileName = `Performance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
      toast.success("Excel report downloaded successfully");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-600 rounded-full"></span>
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>

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
                {stat.change && (
                  <p className={`text-xs mt-2 flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{stat.change.startsWith('+') ? '↑' : '↓'}</span> {stat.change}
                  </p>
                )}
              </div>
              <div className={`${stat.bgColor} p-4 rounded-2xl`}>
                <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'department', 'trends', 'performance'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              reportType === type
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Task Trends</h2>
            <PresentationChartLineIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="tasks" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTasks)" name="Total Tasks" />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Task Distribution</h2>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Department Performance</h2>
            <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">All Departments</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={performanceData.length > 0 ? performanceData.map(p => ({
                  name: p.userName,
                  completed: p.completedTasks,
                  pending: p.totalTasks - p.completedTasks,
                  overdue: p.overdueTasks
                })) : departmentData} 
                layout="vertical" 
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis type="category" dataKey="name" stroke="#6B7280" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                <Bar dataKey="overdue" stackId="a" fill="#EF4444" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tasks" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            <TableCellsIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Completed</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pending</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Overdue</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rate</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.length > 0 ? (
                  performanceData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{item.userName} ({item.role})</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.totalTasks}</td>
                      <td className="py-3 px-4 text-sm text-green-600">{item.completedTasks}</td>
                      <td className="py-3 px-4 text-sm text-yellow-600">{item.totalTasks - item.completedTasks}</td>
                      <td className="py-3 px-4 text-sm text-red-600">{item.overdueTasks}</td>
                      <td className="py-3 px-4 text-sm font-medium">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {item.efficiency}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  departmentData.map((dept, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{dept.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{dept.total}</td>
                      <td className="py-3 px-4 text-sm text-green-600">{dept.completed}</td>
                      <td className="py-3 px-4 text-sm text-yellow-600">{dept.pending}</td>
                      <td className="py-3 px-4 text-sm text-red-600">{dept.overdue}</td>
                      <td className="py-3 px-4 text-sm font-medium">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {Math.round((dept.completed / dept.total) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsDashboard;