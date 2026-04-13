import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon, ArrowDownTrayIcon, CalendarIcon, CheckCircleIcon,
  ClockIcon, ExclamationTriangleIcon, TableCellsIcon, XMarkIcon,
  ArrowPathIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { getPerformanceReport, getGlobalStats } from '../../services/reportService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReportsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [performanceData, setPerformanceData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');

  const showToast = (title, value) => {
    setToast({ title, value });
    setTimeout(() => setToast(null), 3000);
  };

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
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Stats cards in correct sequence: Total, Completed, In Progress, Pending, Overdue
  const stats = [
    { title: 'Total Tasks', value: globalStats?.total || 0, icon: DocumentTextIcon, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Completed', value: globalStats?.completed || 0, icon: CheckCircleIcon, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { title: 'In Progress', value: globalStats?.inProgress || 0, icon: ArrowPathIcon, bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
    { title: 'Pending', value: globalStats?.pending || 0, icon: ClockIcon, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { title: 'Overdue', value: globalStats?.overdue || 0, icon: ExclamationTriangleIcon, bgColor: 'bg-red-50', textColor: 'text-red-600' }
  ];

  // Department data with all metrics in correct sequence
  const deptData = performanceData.map((p, idx) => ({
    srNo: idx + 1,
    name: p.userName,
    total: p.totalTasks,
    completed: p.completedTasks,
    inProgress: p.totalTasks - p.completedTasks - (p.overdueTasks || 0),
    pending: p.totalTasks - p.completedTasks,
    overdue: p.overdueTasks || 0,
    rate: p.efficiency || 0
  }));

  const filteredDeptData = selectedDept === 'all' ? deptData : deptData.filter(d => d.name === selectedDept);
  const deptNames = [...new Set(deptData.map(d => d.name))];

  // Department chart data for bar chart
  const deptChartData = filteredDeptData.map(d => ({
    name: d.name,
    Completed: d.completed,
    'In Progress': d.inProgress,
    Pending: d.pending,
    Overdue: d.overdue,
    Total: d.total
  }));

  // Task distribution
  const taskDistribution = [
    { name: 'Completed', value: globalStats?.completed || 0, color: '#10B981' },
    { name: 'In Progress', value: globalStats?.inProgress || 0, color: '#6B7280' },
    { name: 'Pending', value: globalStats?.pending || 0, color: '#F59E0B' },
    { name: 'Overdue', value: globalStats?.overdue || 0, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // Trend data generators with correct sequence
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      period: month,
      total: globalStats?.total || 0,
      completed: globalStats?.completed || 0,
      inProgress: globalStats?.inProgress || 0,
      pending: globalStats?.pending || 0,
      overdue: globalStats?.overdue || 0
    }));
  };

  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      period: day,
      total: day === 'Mon' ? (globalStats?.total || 0) : 0,
      completed: day === 'Mon' ? (globalStats?.completed || 0) : 0,
      inProgress: day === 'Mon' ? (globalStats?.inProgress || 0) : 0,
      pending: day === 'Mon' ? (globalStats?.pending || 0) : 0,
      overdue: day === 'Mon' ? (globalStats?.overdue || 0) : 0
    }));
  };

  const getQuarterlyData = () => {
    return ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
      period: q,
      total: q === 'Q1' ? (globalStats?.total || 0) : 0,
      completed: q === 'Q1' ? (globalStats?.completed || 0) : 0,
      inProgress: q === 'Q1' ? (globalStats?.inProgress || 0) : 0,
      pending: q === 'Q1' ? (globalStats?.pending || 0) : 0,
      overdue: q === 'Q1' ? (globalStats?.overdue || 0) : 0
    }));
  };

  const getYearlyData = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1].map(year => ({
      period: year.toString(),
      total: year === currentYear ? (globalStats?.total || 0) : 0,
      completed: year === currentYear ? (globalStats?.completed || 0) : 0,
      inProgress: year === currentYear ? (globalStats?.inProgress || 0) : 0,
      pending: year === currentYear ? (globalStats?.pending || 0) : 0,
      overdue: year === currentYear ? (globalStats?.overdue || 0) : 0
    }));
  };

  const getTrendData = () => {
    switch(dateRange) {
      case 'week': return getWeeklyData();
      case 'month': return getMonthlyData();
      case 'quarter': return getQuarterlyData();
      case 'year': return getYearlyData();
      default: return getMonthlyData();
    }
  };

  const handleExport = () => {
    try {
      const exportData = deptData.map(d => ({
        'SR NO': d.srNo,
        'Department': d.name,
        'Total Tasks': d.total,
        'Completed': d.completed,
        'In Progress': d.inProgress,
        'Pending': d.pending,
        'Overdue': d.overdue,
        'Completion Rate': `${d.rate}%`
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Performance Report");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelBuffer]), `Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Report exported', 'success');
    } catch (_error) {
      showToast('Export failed', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 p-3 px-5">
              <CheckCircleIcon className="h-5 w-5 text-white/80" />
              <div><p className="text-sm font-medium">{toast.title}</p><p className="text-lg font-bold">{toast.value}</p></div>
              <button onClick={() => setToast(null)} className="text-white/70 hover:text-white"><XMarkIcon className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
          <button onClick={handleExport} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 text-sm">
            <ArrowDownTrayIcon className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} onClick={() => showToast(stat.title, stat.value)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 cursor-pointer">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">{stat.title}</p><p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p></div>
              <div className={`${stat.bgColor} p-2 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.textColor}`} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'department', 'trends', 'performance'].map((type) => (
          <button key={type} onClick={() => setReportType(type)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              reportType === type ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Task Trends</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="period" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="inProgress" name="In Progress" stroke="#6B7280" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pending" name="Pending" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="overdue" name="Overdue" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Task Distribution</h2>
            <p className="text-xs text-gray-500 mb-3">Current status breakdown ({globalStats?.total || 0} total tasks)</p>
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
      )}

      {/* Department Tab with Bar Chart + Table */}
      {reportType === 'department' && (
        <div className="space-y-6">
          {/* Bar Chart Section */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2"><UserGroupIcon className="h-5 w-5 text-blue-500" /> Department Performance Chart</h2>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                <option value="all">All Departments</option>
                {deptNames.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis type="category" dataKey="name" stroke="#6B7280" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Total" name="Total" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Completed" name="Completed" fill="#10B981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="In Progress" name="In Progress" fill="#6B7280" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Pending" name="Pending" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Overdue" name="Overdue" fill="#EF4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><TableCellsIcon className="h-5 w-5 text-blue-500" /> Department Data</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">SR NO</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Department</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Total</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Completed</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">In Progress</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Pending</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Overdue</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDeptData.map((d) => (
                    <tr key={d.srNo} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-600">{d.srNo}</td>
                      <td className="px-3 py-2 text-sm text-gray-800">{d.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{d.total}</td>
                      <td className="px-3 py-2 text-sm text-green-600">{d.completed}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{d.inProgress}</td>
                      <td className="px-3 py-2 text-sm text-amber-600">{d.pending}</td>
                      <td className="px-3 py-2 text-sm text-red-600">{d.overdue}</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">{d.rate}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {reportType === 'trends' && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Activity Trends</h2>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              <option value="week">Weekly</option><option value="month">Monthly</option><option value="quarter">Quarterly</option><option value="year">Yearly</option>
            </select>
          </div>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Period</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Total</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Completed</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">In Progress</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Pending</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Overdue</th></tr>
              </thead>
              <tbody className="divide-y">
                {getTrendData().map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-gray-800">{item.period}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{item.total}</td>
                    <td className="px-3 py-2 text-sm text-green-600">{item.completed}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{item.inProgress}</td>
                    <td className="px-3 py-2 text-sm text-amber-600">{item.pending}</td>
                    <td className="px-3 py-2 text-sm text-red-600">{item.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#6B7280" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {reportType === 'performance' && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><TableCellsIcon className="h-5 w-5 text-blue-500" /> Performance Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">SR NO</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Department</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Total</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Completed</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">In Progress</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Pending</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Overdue</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deptData.map((d) => (
                  <tr key={d.srNo} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{d.srNo}</td>
                    <td className="px-3 py-2 text-sm text-gray-800">{d.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{d.total}</td>
                    <td className="px-3 py-2 text-sm text-green-600">{d.completed}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{d.inProgress}</td>
                    <td className="px-3 py-2 text-sm text-amber-600">{d.pending}</td>
                    <td className="px-3 py-2 text-sm text-red-600">{d.overdue}</td>
                    <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">{d.rate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;