import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Nav, Table, Badge, Spinner, Form, Toast, ToastContainer 
} from 'react-bootstrap';
import {
  DocumentTextIcon, ArrowDownTrayIcon, CalendarIcon, CheckCircleIcon,
  ClockIcon, ExclamationTriangleIcon, TableCellsIcon, XMarkIcon,
  ArrowPathIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { getPerformanceReport, getGlobalStats } from '../../../services/reports/reportService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from '../../common/Pagination';

const ReportsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [performanceData, setPerformanceData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDept]);

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

  // Stats cards in correct sequence
  const stats = [
    { title: 'Total Tasks', value: globalStats?.total || 0, icon: DocumentTextIcon, bgColor: 'primary', textColor: 'text-primary' },
    { title: 'Completed', value: globalStats?.completed || 0, icon: CheckCircleIcon, bgColor: 'success', textColor: 'text-success' },
    { title: 'In Progress', value: globalStats?.inProgress || 0, icon: ArrowPathIcon, bgColor: 'secondary', textColor: 'text-secondary' },
    { title: 'Pending', value: globalStats?.pending || 0, icon: ClockIcon, bgColor: 'warning', textColor: 'text-warning' },
    { title: 'Overdue', value: globalStats?.overdue || 0, icon: ExclamationTriangleIcon, bgColor: 'danger', textColor: 'text-danger' }
  ];

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

  const deptChartData = filteredDeptData.map(d => ({
    name: d.name,
    Completed: d.completed,
    'In Progress': d.inProgress,
    Pending: d.pending,
    Overdue: d.overdue,
    Total: d.total
  }));

  const taskDistribution = [
    { name: 'Completed', value: globalStats?.completed || 0, color: '#198754' },
    { name: 'In Progress', value: globalStats?.inProgress || 0, color: '#6c757d' },
    { name: 'Pending', value: globalStats?.pending || 0, color: '#ffc107' },
    { name: 'Overdue', value: globalStats?.overdue || 0, color: '#dc3545' },
  ].filter(item => item.value > 0);

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

  // ... (keeping other trend data functions)
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
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="p-4 p-lg-5 bg-light min-vh-100">
      <ToastContainer position="top-center" className="p-3">
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

      {/* Header */}
      <div className="mb-5">
        <Row className="align-items-center justify-content-between g-4">
          <Col md={8}>
            <h1 className="display-6 fw-bold text-primary mb-1 font-outfit">Reports & Analytics</h1>
            <p className="text-secondary mb-0">Comprehensive insights and performance metrics</p>
          </Col>
          <Col md="auto">
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
            <Card className="border-0 shadow-sm rounded-4 h-100 hover-shadow transition-all cursor-pointer" onClick={() => showToast(stat.title, stat.value)}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="small text-secondary fw-medium mb-1">{stat.title}</p>
                    <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-3 bg-${stat.bgColor} bg-opacity-10`}>
                    <stat.icon style={{ width: '1.5rem' }} className={stat.textColor} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tab Navigation */}
      <Nav variant="pills" className="bg-white p-2 rounded-4 shadow-sm mb-5 gap-2 border w-fit" activeKey={reportType}>
        {['overview', 'department', 'trends', 'performance'].map((type) => (
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
                      <Line type="monotone" dataKey="total" name="Total" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="completed" name="Completed" stroke="#198754" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="pending" name="Pending" stroke="#ffc107" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
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
                <p className="small text-secondary mb-0">Current status breakdown ({globalStats?.total || 0} total tasks)</p>
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
                <Form.Select 
                  value={selectedDept} 
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-auto border-0 bg-light rounded-3 fw-medium"
                  style={{ minWidth: '200px' }}
                >
                  <option value="all">All Departments</option>
                  {deptNames.map(d => <option key={d} value={d}>{d}</option>)}
                </Form.Select>
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
                    <Bar dataKey="Total" fill="#0d6efd" radius={[0, 6, 6, 0]} barSize={20} />
                    <Bar dataKey="Completed" fill="#198754" radius={[0, 6, 6, 0]} barSize={20} />
                    <Bar dataKey="Overdue" fill="#dc3545" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-transparent border-0 p-4 pb-0">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <TableCellsIcon style={{ width: '1.25rem' }} className="text-primary" /> 
                Department Data Details
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Table responsive hover className="align-middle border-top-0">
                <thead className="bg-light bg-opacity-50">
                  <tr className="text-secondary small fw-bold text-uppercase pb-3">
                    <th className="border-0 px-3">SR NO</th>
                    <th className="border-0 px-3">Department</th>
                    <th className="border-0 px-3">Total</th>
                    <th className="border-0 px-3 text-success">Completed</th>
                    <th className="border-0 px-3 text-warning">Pending</th>
                    <th className="border-0 px-3 text-danger">Overdue</th>
                    <th className="border-0 px-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filteredDeptData
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((d) => (
                    <tr key={d.srNo}>
                      <td className="px-3 py-3 small text-secondary">{d.srNo}</td>
                      <td className="px-3 py-3 fw-bold text-dark">{d.name}</td>
                      <td className="px-3 py-3 fw-medium">{d.total}</td>
                      <td className="px-3 py-3 text-success fw-medium font-outfit">{d.completed}</td>
                      <td className="px-3 py-3 text-warning fw-medium font-outfit">{d.pending}</td>
                      <td className="px-3 py-3 text-danger fw-medium font-outfit">{d.overdue}</td>
                      <td className="px-3 py-3">
                        <Badge pill bg="success" className="bg-opacity-10 text-success fw-bold px-3 py-2">
                          {d.rate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="mt-4">
                <Pagination 
                  totalItems={filteredDeptData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </Card.Body>
          </Card>
        </div>
      )}


      {/* Trends Tab */}
      {reportType === 'trends' && (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Header className="bg-transparent border-0 p-4 pb-0">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <h5 className="fw-bold text-dark mb-0">Activity Trends</h5>
              <Form.Select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="w-auto border-0 bg-light rounded-3 fw-medium"
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
                    <th className="px-3">Total</th>
                    <th className="px-3 text-success">Completed</th>
                    <th className="px-3 text-warning">Pending</th>
                    <th className="px-3 text-danger">Overdue</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {getTrendData().map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-3 fw-bold text-dark">{item.period}</td>
                      <td className="px-3 py-3 fw-medium">{item.total}</td>
                      <td className="px-3 py-3 text-success fw-medium font-outfit">{item.completed}</td>
                      <td className="px-3 py-3 text-warning fw-medium font-outfit">{item.pending}</td>
                      <td className="px-3 py-3 text-danger fw-medium font-outfit">{item.overdue}</td>
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
                  <Bar dataKey="total" name="Total Tasks" fill="#0d6efd" radius={[6, 6, 0, 0]} barSize={25} />
                  <Bar dataKey="completed" name="Completed" fill="#198754" radius={[6, 6, 0, 0]} barSize={25} />
                  <Bar dataKey="overdue" name="Overdue" fill="#dc3545" radius={[6, 6, 0, 0]} barSize={25} />
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
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <TableCellsIcon style={{ width: '1.25rem' }} className="text-primary" /> 
              Performance Summary Matrix
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Table responsive hover className="align-middle">
              <thead className="bg-light bg-opacity-50">
                <tr className="text-secondary small fw-bold text-uppercase pb-3">
                  <th className="px-3 border-0">SR NO</th>
                  <th className="px-3 border-0">Department</th>
                  <th className="px-3 border-0">Total</th>
                  <th className="px-3 border-0 text-success">Completed</th>
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
                    <td className="px-3 py-3 fw-medium">{d.total}</td>
                    <td className="px-3 py-3 text-success fw-medium font-outfit">{d.completed}</td>
                    <td className="px-3 py-3 text-danger fw-medium font-outfit">{d.overdue}</td>
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
            <div className="mt-4">
              <Pagination 
                totalItems={deptData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ReportsDashboard;