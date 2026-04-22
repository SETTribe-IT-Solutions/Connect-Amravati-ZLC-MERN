import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Nav, Table, Badge, Spinner, Form, Toast, ToastContainer, Modal 
} from 'react-bootstrap';
import {
  DocumentTextIcon, ArrowDownTrayIcon, CalendarIcon, CheckCircleIcon,
  ClockIcon, ExclamationTriangleIcon, TableCellsIcon, XMarkIcon,
  ArrowPathIcon, UserGroupIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { getPerformanceReport, getGlobalStats } from '../../../services/reports/reportService';
import { getTasks } from '../../../services/tasks/taskService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from '../../common/Pagination';

const ReportsDashboard = ({ user }) => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [performanceData, setPerformanceData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [globalDept, setGlobalDept] = useState('all');
  const [selectedSummary, setSelectedSummary] = useState('all');
  const [allTasks, setAllTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedRoleChart, setSelectedRoleChart] = useState('all');
  const [selectedUserChart, setSelectedUserChart] = useState('all');
  const [taskCurrentPage, setTaskCurrentPage] = useState(1);
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [drillDownModal, setDrillDownModal] = useState({ show: false, title: '', tasks: [] });

  const handleDrillDown = (period, statusType, taskList) => {
    if (taskList.length === 0) {
      showToast(`No ${statusType.toLowerCase()} tasks in ${period}`, 'info');
      return;
    }
    setDrillDownModal({
      show: true,
      title: `${statusType} Tasks - ${period}`,
      tasks: taskList
    });
  };

  const departments = ['All Departments', 'Revenue', 'Finance', 'Administration', 'Development', 'Infrastruction', 'Other'];

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setTaskCurrentPage(1);
  }, [selectedDept, globalDept, selectedSummary, selectedRoleChart, selectedUserChart]);

  const showToast = (title, value) => {
    setToast({ title, value });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const requesterId = user?.userID;
        if (requesterId) {
          const [perf, tasks] = await Promise.all([
            getPerformanceReport(requesterId),
            getTasks(requesterId)
          ]);

          const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
          const serverURL = baseURL.replace('/api', '');
          
          const mappedTasks = (tasks || []).map(t => ({
            ...t,
            status: t.status ? t.status.toString().toUpperCase() : 'PENDING',
            department: t.department || 'Revenue'
          }));

          setPerformanceData(perf || []);
          setAllTasks(mappedTasks);
          
          // Calculate stats locally from mappedTasks
          setGlobalStats({
            total: mappedTasks.length,
            completed: mappedTasks.filter(t => t.status === 'COMPLETED').length,
            inProgress: mappedTasks.filter(t => t.status === 'IN_PROGRESS').length,
            pending: mappedTasks.filter(t => t.status === 'PENDING').length,
            overdue: mappedTasks.filter(t => t.status === 'OVERDUE').length
          });
        }
      } catch (error) {
        console.error("Fetch Reports Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user?.userID]);

  // Stats cards in correct sequence
  const stats = [
    { id: 'all', title: 'Total Tasks', value: globalStats?.total || 0, icon: DocumentTextIcon, bgColor: '#eff6ff', textColor: '#0d6efd' },
    { id: 'completed', title: 'Completed', value: globalStats?.completed || 0, icon: CheckCircleIcon, bgColor: '#f0fdf4', textColor: '#16a34a' },
    { id: 'inProgress', title: 'In Progress', value: globalStats?.inProgress || 0, icon: ArrowPathIcon, bgColor: '#f8fafc', textColor: '#64748b' },
    { id: 'pending', title: 'Pending', value: globalStats?.pending || 0, icon: ClockIcon, bgColor: '#fff7ed', textColor: '#f97316' },
    { id: 'overdue', title: 'Overdue', value: globalStats?.overdue || 0, icon: ExclamationTriangleIcon, bgColor: '#fef2f2', textColor: '#dc2626' }
  ];

  // Derived data based on filters
  const activeTasks = allTasks.filter(t => {
    const deptMatch = globalDept === 'all' || t.department === globalDept;
    const statusMatch = selectedSummary === 'all' || t.status === selectedSummary.toUpperCase();
    return deptMatch && statusMatch;
  });

  const deptData = performanceData
    .filter(p => p.role !== 'SYSTEM_ADMINISTRATOR' && p.userName !== 'Admin User')
    .map((p, idx) => {
    const userTasks = allTasks.filter(t => t.assignedToId === p.userId || t.assignedToName === p.userName);
    // Determine department for this user from their tasks
    const userDept = userTasks.length > 0 ? userTasks[0].department || 'Other' : 'Other';
    
    const filtered = userTasks.filter(t => selectedSummary === 'all' || t.status === selectedSummary.toUpperCase());
    
    return {
      srNo: idx + 1,
      name: p.userName,
      role: p.role || 'Staff',
      department: userDept,
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === 'COMPLETED').length,
      inProgress: userTasks.filter(t => t.status === 'IN_PROGRESS').length,
      pending: userTasks.filter(t => t.status === 'PENDING').length,
      overdue: userTasks.filter(t => t.status === 'OVERDUE').length,
      activeCount: filtered.length,
      rate: userTasks.length > 0 ? Math.round((userTasks.filter(t => t.status === 'COMPLETED').length / userTasks.length) * 100) : 0,
      tasks: userTasks
    };
  });

  const filteredDeptData = deptData.filter(d => {
    const deptMatch = globalDept === 'all' || d.department === globalDept || (selectedDept !== 'all' && d.department === selectedDept);
    if (!deptMatch) return false;
    
    // Global Summary filter
    if (selectedSummary !== 'all' && d.activeCount === 0) return false;
    
    return true;
  });

  const searchedDeptData = filteredDeptData.filter(d => {
    if (!searchTerm) return true;
    const searchLow = searchTerm.toLowerCase();
    
    const userTasks = activeTasks.filter(t => t.assignedToName === d.name);
    const taskMatch = userTasks.some(t => 
      (t.title && t.title.toLowerCase().includes(searchLow)) ||
      (t.description && t.description.toLowerCase().includes(searchLow))
    );

    return (
      d.name.toLowerCase().includes(searchLow) ||
      d.role.toLowerCase().includes(searchLow) ||
      d.department.toLowerCase().includes(searchLow) ||
      d.total.toString().includes(searchLow) ||
      d.completed.toString().includes(searchLow) ||
      d.inProgress.toString().includes(searchLow) ||
      d.pending.toString().includes(searchLow) ||
      d.overdue.toString().includes(searchLow) ||
      d.rate.toString().includes(searchLow) ||
      taskMatch
    );
  });

  const deptNames = departments.filter(d => d !== 'All Departments');

  const availableRoles = [...new Set(filteredDeptData.map(d => d.role).filter(Boolean))].filter(r => r !== 'SYSTEM_ADMINISTRATOR');
  const chartUsersList = filteredDeptData.filter(d => selectedRoleChart === 'all' || d.role === selectedRoleChart);
  const availableUsers = [...new Set(chartUsersList.map(d => d.name))];

  const chartFilteredData = filteredDeptData.filter(d => {
    const roleMatch = selectedRoleChart === 'all' || d.role === selectedRoleChart;
    const userMatch = selectedUserChart === 'all' || d.name === selectedUserChart;
    return roleMatch && userMatch;
  });

  const deptChartData = chartFilteredData.map(d => ({
    name: d.name,
    Completed: d.completed,
    'In Progress': d.inProgress,
    Pending: d.pending,
    Overdue: d.overdue,
    Total: d.total
  }));

  const searchedActiveTasks = activeTasks.filter(t => {
    if (!taskSearchTerm) return true;
    const searchLow = taskSearchTerm.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(searchLow)) ||
      (t.description && t.description.toLowerCase().includes(searchLow)) ||
      (t.assignedToName && t.assignedToName.toLowerCase().includes(searchLow)) ||
      (t.status && t.status.toLowerCase().includes(searchLow))
    );
  });

  const taskDistribution = [
    { name: 'Completed', value: globalStats?.completed || 0, color: '#198754' },
    { name: 'In Progress', value: globalStats?.inProgress || 0, color: '#6c757d' },
    { name: 'Pending', value: globalStats?.pending || 0, color: '#f97316' },
    { name: 'Overdue', value: globalStats?.overdue || 0, color: '#dc3545' },
  ].filter(item => {
    if (selectedSummary === 'all') return item.value > 0;
    return item.name.toLowerCase() === (selectedSummary === 'inProgress' ? 'in progress' : selectedSummary) && item.value > 0;
  });

  const mapPeriodData = (period, filtered) => ({
    period,
    total: filtered.length,
    completed: filtered.filter(t => t.status === 'COMPLETED').length,
    inProgress: filtered.filter(t => t.status === 'IN_PROGRESS').length,
    pending: filtered.filter(t => t.status === 'PENDING').length,
    overdue: filtered.filter(t => t.status === 'OVERDUE').length,
    tasks: filtered
  });

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    return months.map((month, index) => {
      const filtered = activeTasks.filter(t => {
        if (!t.createdAt) return false;
        const d = new Date(t.createdAt);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      return mapPeriodData(month, filtered);
    });
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const filtered = activeTasks.filter(t => {
        if (!t.createdAt) return false;
        const td = new Date(t.createdAt);
        return td.toDateString() === date.toDateString();
      });
      return mapPeriodData(days[date.getDay()], filtered);
    });
  };

  const getQuarterlyData = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentYear = new Date().getFullYear();
    return quarters.map((q, idx) => {
      const filtered = activeTasks.filter(t => {
        if (!t.createdAt) return false;
        const d = new Date(t.createdAt);
        const quarter = Math.floor(d.getMonth() / 3);
        return quarter === idx && d.getFullYear() === currentYear;
      });
      return mapPeriodData(q, filtered);
    });
  };

  const getYearlyData = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    return years.map(year => {
      const filtered = activeTasks.filter(t => {
        if (!t.createdAt) return false;
        const d = new Date(t.createdAt);
        return d.getFullYear() === year;
      });
      return mapPeriodData(year.toString(), filtered);
    });
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
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="p-4 p-lg-5 bg-light min-vh-100">
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={!!toast} onClose={() => setToast(null)} className="shadow-lg border-0 rounded-3">
          <Toast.Body className="bg-primary text-white p-3 rounded-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <CheckCircleIcon style={{ width: '1.25rem' }} />
              <div>
                <p className="small mb-0 fw-medium">{toast?.title}</p>
                <p className="h6 mb-0 fw-bold">{toast?.value}</p>
              </div>
            </div>
            <XMarkIcon style={{ width: '1rem' }} className="cursor-pointer" onClick={() => setToast(null)} />
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Drill Down Modal */}
      <Modal show={drillDownModal.show} onHide={() => setDrillDownModal({ ...drillDownModal, show: false })} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <DocumentTextIcon style={{ width: '1.25rem' }} className="text-primary" />
            {drillDownModal.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="table-responsive border border-light rounded-3 shadow-sm custom-scrollbar" style={{ maxHeight: '400px' }}>
            <Table hover className="align-middle mb-0">
              <thead className="bg-light sticky-top">
                <tr className="text-secondary small fw-bold text-uppercase">
                  <th className="px-3 py-2 border-0">Task Title</th>
                  <th className="px-3 py-2 border-0">Assigned To</th>
                  <th className="px-3 py-2 border-0">Due Date</th>
                  <th className="px-3 py-2 border-0">Status</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {drillDownModal.tasks.map((t, i) => (
                  <tr key={t.id || i}>
                    <td className="px-3 py-3 fw-medium text-dark">{t.title}</td>
                    <td className="px-3 py-3 small text-secondary">{t.assignedToName || 'Unassigned'}</td>
                    <td className="px-3 py-3 small text-secondary">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</td>
                    <td className="px-3 py-3">
                      <Badge bg={
                        t.status === 'COMPLETED' ? 'success' :
                        t.status === 'PENDING' ? 'warning' :
                        t.status === 'OVERDUE' ? 'danger' : 'secondary'
                      } style={{ fontSize: '0.65rem' }}>{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>

      {/* Header */}
      <div className="mb-5">
        <Row className="align-items-center justify-content-between g-4">
          <Col md={8}>
            <h1 className="display-6 fw-bold text-primary mb-1 font-outfit">Reports & Analytics</h1>
            <p className="text-secondary mb-0">Comprehensive insights and performance metrics</p>
          </Col>
          <Col md="auto" className="d-flex gap-2">
            <Form.Select 
              value={globalDept} 
              onChange={(e) => setGlobalDept(e.target.value)}
              className="w-auto border-0 bg-white shadow-sm rounded-3 fw-bold text-dark"
              style={{ minWidth: '180px' }}
            >
              {departments.map(dept => (
                <option key={dept} value={dept === 'All Departments' ? 'all' : dept}>{dept}</option>
              ))}
            </Form.Select>
            <Button onClick={handleExport} variant="primary" className="fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2">
              <ArrowDownTrayIcon style={{ width: '1.1rem' }} /> Export Report
            </Button>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        {stats.map((stat) => (
          <Col key={stat.title} xs={6} md={3} lg={true}>
            <Card 
              className={`border-0 shadow-sm rounded-4 h-100 hover-shadow transition-all cursor-pointer ${selectedSummary === stat.id ? 'ring-2 ring-primary border border-primary' : ''}`} 
              onClick={() => {
                setSelectedSummary(stat.id === selectedSummary ? 'all' : stat.id);
                showToast(stat.title, stat.value);
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="small text-secondary fw-medium mb-1">{stat.title}</p>
                    <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                  </div>
                  <div className="rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: stat.bgColor }}>
                    <stat.icon style={{ width: '1.5rem', height: '1.5rem', color: stat.textColor }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tab Navigation */}
      <Nav variant="pills" className="bg-white p-2 rounded-4 shadow-sm mb-5 gap-2 border w-fit" activeKey={reportType}>
        {['overview', 'department', 'analytics', 'performance'].map((type) => (
          <Nav.Item key={type}>
            <Nav.Link 
              eventKey={type} 
              onClick={() => setReportType(type)}
              className={`px-4 py-2 fw-bold text-capitalize rounded-3 ${reportType === type ? 'shadow-sm' : 'text-secondary'}`}
            >
              {type}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Overview Tab */}
      {reportType === 'overview' && (
        <Row className="g-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                <h5 className="fw-bold text-dark mb-0">Task Trends</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      {(selectedSummary === 'all' || selectedSummary === 'all') && <Line type="monotone" dataKey="total" name="Total" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />}
                      {(selectedSummary === 'all' || selectedSummary === 'completed') && <Line type="monotone" dataKey="completed" name="Completed" stroke="#198754" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />}
                      {(selectedSummary === 'all' || selectedSummary === 'inProgress') && <Line type="monotone" dataKey="inProgress" name="In Progress" stroke="#6c757d" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />}
                      {(selectedSummary === 'all' || selectedSummary === 'pending') && <Line type="monotone" dataKey="pending" name="Pending" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />}
                      {(selectedSummary === 'all' || selectedSummary === 'overdue') && <Line type="monotone" dataKey="overdue" name="Overdue" stroke="#dc3545" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={5}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                <h5 className="fw-bold text-dark mb-1">Task Distribution</h5>
                <p className="small text-secondary mb-0">
                  {selectedSummary === 'all' ? `Current status breakdown (${globalStats?.total || 0} total tasks)` : `Viewing ${selectedSummary} tasks`}
                </p>
              </Card.Header>
              <Card.Body className="p-4 d-flex align-items-center justify-content-center">
                <div style={{ height: '300px', width: '100%' }}>
                  {taskDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={taskDistribution} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={70} 
                          outerRadius={100} 
                          paddingAngle={5} 
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {taskDistribution.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (<div className="h-100 d-flex align-items-center justify-content-center text-secondary">No tasks available</div>)}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Department Tab */}
      {reportType === 'department' && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-transparent border-0 p-4 pb-0">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <UserGroupIcon style={{ width: '1.25rem' }} className="text-primary" /> 
                  Department Performance Chart
                </h5>
                <div className="d-flex gap-2">
                  <Form.Select 
                    value={selectedRoleChart} 
                    onChange={(e) => { setSelectedRoleChart(e.target.value); setSelectedUserChart('all'); }}
                    className="w-auto border-0 bg-light rounded-3 fw-medium text-dark"
                    style={{ minWidth: '150px' }}
                  >
                    <option value="all">All Roles</option>
                    {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </Form.Select>
                  <Form.Select 
                    value={selectedUserChart} 
                    onChange={(e) => setSelectedUserChart(e.target.value)}
                    className="w-auto border-0 bg-light rounded-3 fw-medium text-dark"
                    style={{ minWidth: '150px' }}
                  >
                    <option value="all">All Users</option>
                    {availableUsers.map(u => <option key={u} value={u}>{u}</option>)}
                  </Form.Select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} layout="vertical" margin={{ left: 50, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f5" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={120} />
                    <Tooltip cursor={{ fill: '#f8f9fa' }} />
                    <Legend />
                    {(selectedSummary === 'all') && <Bar dataKey="Total" fill="#0d6efd" radius={[0, 6, 6, 0]} barSize={20} />}
                    {(selectedSummary === 'all' || selectedSummary === 'completed') && <Bar dataKey="Completed" fill="#198754" radius={[0, 6, 6, 0]} barSize={20} />}
                    {(selectedSummary === 'all' || selectedSummary === 'inProgress') && <Bar dataKey="In Progress" fill="#6c757d" radius={[0, 6, 6, 0]} barSize={20} />}
                    {(selectedSummary === 'all' || selectedSummary === 'pending') && <Bar dataKey="Pending" fill="#f97316" radius={[0, 6, 6, 0]} barSize={20} />}
                    {(selectedSummary === 'all' || selectedSummary === 'overdue') && <Bar dataKey="Overdue" fill="#dc3545" radius={[0, 6, 6, 0]} barSize={20} />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-transparent border-0 p-4 pb-0">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <TableCellsIcon style={{ width: '1.25rem' }} className="text-primary" /> 
                  Department Data Details
                </h5>
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control 
                      type="number"
                      min="1"
                      size="sm" 
                      className="border-0 bg-light rounded-3 fw-bold text-dark text-center px-1" 
                      style={{ width: '60px', padding: '0.375rem' }} 
                      value={itemsPerPage} 
                      onChange={(e) => { 
                        setItemsPerPage(e.target.value ? Number(e.target.value) : 1); 
                        setCurrentPage(1); 
                      }}
                    />
                    <span className="small text-secondary fw-medium text-nowrap">per page</span>
                  </div>
                  <div className="position-relative" style={{ minWidth: '300px' }}>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, role or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ps-5 border-0 bg-light rounded-3 fw-medium"
                    />
                    <MagnifyingGlassIcon 
                      className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary" 
                      style={{ width: '1.25rem' }} 
                    />
                  </div>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Table responsive hover className="align-middle border-top-0">
                <thead className="bg-light bg-opacity-50">
                  <tr className="text-secondary small fw-bold text-uppercase pb-3">
                    <th className="border-0 px-3">SR NO</th>
                    <th className="border-0 px-3">Department</th>
                    <th className="border-0 px-3" style={{ minWidth: '250px' }}>Task Details</th>
                    <th className="border-0 px-3 text-primary">Total</th>
                    <th className="border-0 px-3 text-success">Completed</th>
                    <th className="border-0 px-3 text-secondary">In Progress</th>
                    <th className="border-0 px-3 text-orange">Pending</th>
                    <th className="border-0 px-3 text-danger">Overdue</th>
                    <th className="border-0 px-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {searchedDeptData
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((d) => (
                    <tr key={d.srNo} className={selectedDept === d.department ? 'table-primary bg-opacity-10' : ''}>
                      <td className="px-3 py-3 small text-secondary">{d.srNo}</td>
                      <td className="px-3 py-3">
                        <div className="fw-bold text-dark">{d.name}</div>
                        <div className="small text-secondary fw-medium">{d.role}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }} className="pe-2 custom-scrollbar">
                          {activeTasks.filter(t => t.assignedToName === d.name).length > 0 ? (
                            activeTasks.filter(t => t.assignedToName === d.name).map((t, idx) => (
                              <div key={t.id || idx} className="mb-2 pb-2 border-bottom border-light">
                                <div className="fw-bold text-dark small mb-1">{t.title || 'Untitled'}</div>
                                <div className="text-secondary mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                  {t.description ? (t.description.length > 50 ? t.description.substring(0, 50) + '...' : t.description) : 'No description'}
                                </div>
                                <div className="d-flex align-items-center">
                                  <span className="text-muted fw-medium" style={{ fontSize: '0.7rem' }}>
                                    Created by: {t.createdByName || 'Unknown'} {t.createdByRole ? `(${t.createdByRole})` : ''}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="small text-secondary">No tasks assigned</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-3 py-3 fw-bold font-outfit ${selectedSummary === 'all' ? 'text-primary bg-primary bg-opacity-10' : 'text-secondary opacity-50'}`}>{d.total}</td>
                      <td className={`px-3 py-3 fw-medium font-outfit ${selectedSummary === 'completed' ? 'text-success bg-success bg-opacity-10 fw-bold' : 'text-success'}`}>{d.completed}</td>
                      <td className={`px-3 py-3 fw-medium font-outfit ${selectedSummary === 'inProgress' ? 'text-dark bg-light fw-bold' : 'text-secondary'}`}>{d.inProgress}</td>
                      <td className={`px-3 py-3 fw-medium font-outfit ${selectedSummary === 'pending' ? 'text-orange bg-orange bg-opacity-10 fw-bold' : 'text-orange'}`}>{d.pending}</td>
                      <td className={`px-3 py-3 fw-medium font-outfit ${selectedSummary === 'overdue' ? 'text-danger bg-danger bg-opacity-10 fw-bold' : 'text-danger'}`}>{d.overdue}</td>
                      <td className="px-3 py-3">
                        <Badge pill bg="success" className="bg-opacity-10 text-success fw-bold px-3 py-2">
                          {d.rate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      )}


      {/* Analytics Tab */}
      {reportType === 'analytics' && (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Header className="bg-transparent border-0 p-4 pb-0">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <h5 className="fw-bold text-dark mb-0">Analytics</h5>
              <Form.Select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="w-auto border-0 bg-light rounded-3 fw-medium text-dark"
                style={{ minWidth: '150px' }}
              >
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
                <option value="year">Yearly</option>
              </Form.Select>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="overflow-x-auto mb-5">
              <Table borderless hover className="align-middle">
                <thead className="bg-light bg-opacity-50">
                  <tr className="text-secondary small fw-bold text-uppercase pb-2">
                    <th className="px-3">Period</th>
                    <th className="px-3 text-primary">Total</th>
                    <th className="px-3 text-success">Completed</th>
                    <th className="px-3 text-secondary">In Progress</th>
                    <th className="px-3 text-orange">Pending</th>
                    <th className="px-3 text-danger">Overdue</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {getTrendData().map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-3 fw-bold text-dark">{item.period}</td>
                      <td className="px-3 py-3 fw-bold cursor-pointer text-primary text-decoration-underline" onClick={() => handleDrillDown(item.period, 'Total', item.tasks)}>{item.total}</td>
                      <td className="px-3 py-3 text-success fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(item.period, 'Completed', item.tasks.filter(t => t.status === 'COMPLETED'))}>{item.completed}</td>
                      <td className="px-3 py-3 text-secondary fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(item.period, 'In Progress', item.tasks.filter(t => t.status === 'IN_PROGRESS'))}>{item.inProgress}</td>
                      <td className="px-3 py-3 text-orange fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(item.period, 'Pending', item.tasks.filter(t => t.status === 'PENDING'))}>{item.pending}</td>
                      <td className="px-3 py-3 text-danger fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(item.period, 'Overdue', item.tasks.filter(t => t.status === 'OVERDUE'))}>{item.overdue}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f8f9fa' }} />
                  <Legend />
                  {(selectedSummary === 'all') && <Bar dataKey="total" name="Total Tasks" fill="#0d6efd" radius={[6, 6, 0, 0]} barSize={25} />}
                  {(selectedSummary === 'all' || selectedSummary === 'completed') && <Bar dataKey="completed" name="Completed" fill="#198754" radius={[6, 6, 0, 0]} barSize={25} />}
                  {(selectedSummary === 'all' || selectedSummary === 'inProgress') && <Bar dataKey="inProgress" name="In Progress" fill="#6c757d" radius={[6, 6, 0, 0]} barSize={25} />}
                  {(selectedSummary === 'all' || selectedSummary === 'pending') && <Bar dataKey="pending" name="Pending" fill="#f97316" radius={[6, 6, 0, 0]} barSize={25} />}
                  {(selectedSummary === 'all' || selectedSummary === 'overdue') && <Bar dataKey="overdue" name="Overdue" fill="#dc3545" radius={[6, 6, 0, 0]} barSize={25} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Performance Tab */}
      {reportType === 'performance' && (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Header className="bg-transparent border-0 p-4 pb-0">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <TableCellsIcon style={{ width: '1.25rem' }} className="text-primary" /> 
                Performance Summary Matrix
              </h5>
              <div className="d-flex align-items-center gap-2">
                <Form.Control 
                  type="number"
                  min="1"
                  size="sm" 
                  className="border-0 bg-light rounded-3 fw-bold text-dark text-center px-1" 
                  style={{ width: '60px', padding: '0.375rem' }} 
                  value={itemsPerPage} 
                  onChange={(e) => { 
                    setItemsPerPage(e.target.value ? Number(e.target.value) : 1); 
                    setCurrentPage(1); 
                  }}
                />
                <span className="small text-secondary fw-medium text-nowrap">per page</span>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Table responsive hover className="align-middle">
              <thead className="bg-light bg-opacity-50">
                <tr className="text-secondary small fw-bold text-uppercase pb-3">
                  <th className="px-3 border-0">SR NO</th>
                  <th className="px-3 border-0">Department</th>
                  <th className="px-3 border-0 text-primary">Total</th>
                  <th className="px-3 border-0 text-success">Completed</th>
                  <th className="px-3 border-0 text-secondary">In Progress</th>
                  <th className="px-3 border-0 text-orange">Pending</th>
                  <th className="px-3 border-0 text-danger">Overdue</th>
                  <th className="px-3 border-0">Efficiency</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {deptData
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((d) => (
                  <tr key={d.srNo}>
                    <td className="px-3 py-3 small text-secondary">{d.srNo}</td>
                    <td className="px-3 py-3 fw-bold text-dark">{d.name}</td>
                    <td className="px-3 py-3 fw-bold text-primary cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(d.name, 'Total', d.tasks)}>{d.total}</td>
                    <td className="px-3 py-3 text-success fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(d.name, 'Completed', d.tasks.filter(t => t.status === 'COMPLETED'))}>{d.completed}</td>
                    <td className="px-3 py-3 text-secondary fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(d.name, 'In Progress', d.tasks.filter(t => t.status === 'IN_PROGRESS'))}>{d.inProgress}</td>
                    <td className="px-3 py-3 text-orange fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(d.name, 'Pending', d.tasks.filter(t => t.status === 'PENDING'))}>{d.pending}</td>
                    <td className="px-3 py-3 text-danger fw-bold font-outfit cursor-pointer text-decoration-underline" onClick={() => handleDrillDown(d.name, 'Overdue', d.tasks.filter(t => t.status === 'OVERDUE'))}>{d.overdue}</td>
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '6px', minWidth: '100px' }}>
                          <div 
                            className={`h-100 rounded-pill ${d.rate > 80 ? 'bg-success' : d.rate > 50 ? 'bg-primary' : 'bg-warning'}`}
                            style={{ width: `${d.rate}%` }}
                          ></div>
                        </div>
                        <span className="small fw-bold text-dark">{d.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ReportsDashboard;