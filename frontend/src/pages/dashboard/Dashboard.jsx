import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  PaperClipIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { getDashboardStats, getTasks, addTaskRemark } from '../../services/tasks/taskService';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, ProgressBar, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const recentActivitiesRef = React.useRef(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [remarkLoading, setRemarkLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0
  });
  const [allTasks, setAllTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [recentTasks, setRecentTasks] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = user?.userID;
        if (userID) {
          const stats = await getDashboardStats(userID);
          setDashboardData(stats);
          const data = await getTasks(userID);
          
          const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
          const serverURL = baseURL.replace('/api', '');
          
          const mapped = (data || []).map(t => ({
            ...t,
            description: t.description || '',
            assignedTo: t.assignedToName || 'N/A',
            assignedBy: t.createdByName || 'Admin',
            status: t.status ? t.status.toString().toUpperCase() : 'PENDING',
            priority: t.priority ? t.priority.toString().toUpperCase() : 'MEDIUM',
            attachments: t.attachment ? [{ name: t.attachment, url: `${serverURL}/uploads/${t.attachment}` }] : [],
            remarks: t.remarks || []
          }));

          setAllTasks(mapped);
          setRecentTasks(mapped);
          
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
          } else if (selectedPeriod === 'year') {
            setChartData([
              { name: 'Q1', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Q2', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Q3', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
              { name: 'Q4', tasks: Math.floor(stats.totalTasks / 4) || 0, completed: Math.floor(stats.completed / 4) || 0, inProgress: Math.floor(stats.inProgress / 4) || 0, pending: Math.floor(stats.pending / 4) || 0, overdue: Math.floor(stats.overdue / 4) || 0 },
            ]);
          } else {
            setChartData([]); // Fallback for other periods
          }
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      }
    };
    fetchData();
  }, [user, selectedPeriod]);

  useEffect(() => {
    if (allTasks.length > 0) {
      let filtered = allTasks;
      if (activeFilter === 'Completed') filtered = allTasks.filter(t => t.status === 'COMPLETED' || t.status === 'Completed');
      else if (activeFilter === 'In Progress') filtered = allTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'In Progress');
      else if (activeFilter === 'Pending') filtered = allTasks.filter(t => t.status === 'PENDING' || t.status === 'Pending');
      else if (activeFilter === 'Overdue') filtered = allTasks.filter(t => t.status === 'OVERDUE' || t.status === 'Overdue');
      
      // If "Total Tasks", it just uses the filtered array (which is allTasks)
      setRecentTasks(filtered);
    }
  }, [activeFilter, allTasks]);

  const getStatusColor = (status) => {
    const s = status?.toUpperCase() || '';
    if (s === 'COMPLETED') return 'success';
    if (s === 'IN_PROGRESS') return 'secondary';
    if (s === 'PENDING') return 'orange';
    if (s === 'OVERDUE') return 'danger';
    return 'secondary';
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase() || '';
    if (p === 'HIGH') return 'danger';
    if (p === 'MEDIUM') return 'warning';
    if (p === 'LOW') return 'success';
    return 'secondary';
  };

  const showToast = (title, value) => {
    setToast({ title, value });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = [
    { name: 'Total Tasks', value: dashboardData.totalTasks, icon: ClipboardDocumentListIcon, bgColor: '#eff6ff', textColor: '#2563eb' },
    { name: 'Completed', value: dashboardData.completed, icon: CheckCircleIcon, bgColor: '#f0fdf4', textColor: '#16a34a' },
    { name: 'In Progress', value: dashboardData.inProgress, icon: ArrowPathIcon, bgColor: '#f8fafc', textColor: '#475569' },
    { name: 'Pending', value: dashboardData.pending, icon: ClockIcon, bgColor: '#fff7ed', textColor: '#f97316' },
    { name: 'Overdue', value: dashboardData.overdue, icon: ExclamationTriangleIcon, bgColor: '#fef2f2', textColor: '#dc2626' }
  ];

  const taskDistribution = [
    { name: 'Completed', value: dashboardData.completed, color: '#10b981' },
    { name: 'In Progress', value: dashboardData.inProgress, color: '#64748b' },
    { name: 'Pending', value: dashboardData.pending, color: '#f97316' },
    { name: 'Overdue', value: dashboardData.overdue, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const handleViewAll = () => { navigate('/tasks?tab=tracking'); };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;
    try {
      setRemarkLoading(true);
      const userID = user?.userID;
      await addTaskRemark(selectedTask.id, remarkText, userID);
      
      // Update selectedTask locally with the new remark
      const newRemark = { remark: remarkText, createdAt: new Date().toISOString() };
      const updatedTask = {
        ...selectedTask,
        remarks: [newRemark, ...(selectedTask.remarks || [])]
      };
      setSelectedTask(updatedTask);
      
      // Also update in allTasks
      setAllTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
      
      setRemarkText('');
      showToast('Remark Added', 'Success');
    } catch (error) {
      console.error("Add Remark Error:", error);
      showToast('Error', 'Failed to add remark');
    } finally {
      setRemarkLoading(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 fw-bold" style={{ 
          background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Dashboard</h1>
        <p className="text-secondary small">Welcome, <span className="fw-bold">{user?.name || 'Collector Office'}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.name} className="col-6 col-md-4 col-lg" style={{ cursor: 'pointer' }} onClick={() => {
            setActiveFilter(stat.name);
            showToast(stat.name, stat.value);
            setTimeout(() => {
              recentActivitiesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}>
            <div className={`premium-card p-3 h-100 border-0 transition-all ${activeFilter === stat.name ? 'ring-2 ring-primary' : ''}`} style={{ outline: activeFilter === stat.name ? '2px solid #2563eb' : 'none' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-secondary mb-1">{stat.name}</p>
                  <p className="h3 fw-bold mb-0 text-dark">{stat.value}</p>
                </div>
                <div className="rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: stat.bgColor }}>
                  <stat.icon style={{ width: '1.5rem', height: '1.5rem', color: stat.textColor }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Dynamic Chart */}
        <div className="col-12 col-xl-7">
          <div className="premium-card p-4 h-100 border-0">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-bold text-dark mb-0">
                {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} Task Overview
              </h5>
              <Form.Select size="sm" style={{ width: 'auto' }} value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">Yearly</option>
              </Form.Select>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="tasks" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="col-12 col-xl-5">
          <div className="premium-card p-4 h-100 border-0">
            <h5 className="fw-bold text-dark mb-1">Task Distribution</h5>
            <p className="small text-secondary mb-4">Current status breakdown</p>
            <div style={{ height: '260px' }}>
              {taskDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {taskDistribution.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.color} strokeWidth={0} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted small italic">
                  No tasks available to display
                </div>
              )}
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
              {taskDistribution.map(item => (
                <div key={item.name} className="d-flex align-items-center gap-2">
                  <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: item.color }}></span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div ref={recentActivitiesRef} className="premium-card p-4 border-0 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="fw-bold text-dark mb-0">Recent Activities</h5>
          <span 
            className="text-primary small fw-bold cursor-pointer hover-underline" 
            style={{ cursor: 'pointer' }}
            onClick={handleViewAll}
          >
            View All
          </span>
        </div>
        <div className="d-flex flex-column gap-2">
          {recentTasks.length > 0 ? recentTasks.map((activity) => (
            <div key={activity.id} className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 transition-all hover-bg-white shadow-hover">
              <div className="overflow-hidden">
                <p className="small fw-bold text-dark mb-0 text-truncate">{activity.title}</p>
                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                  To: {activity.assignedToName || activity.assignedTo} • <span className={`badge ${getStatusColor(activity.status) === 'orange' ? 'bg-orange-opacity-10 text-orange' : `bg-${getStatusColor(activity.status)} bg-opacity-10 text-${getStatusColor(activity.status)}`} uppercase`} style={{ fontSize: '0.65rem' }}>{activity.status}</span>
                </p>
              </div>
              <OverlayTrigger placement="top" overlay={<BootstrapTooltip id={`tooltip-${activity.id}`}>View Task Details</BootstrapTooltip>}>
                <Button variant="light" size="sm" onClick={() => { setSelectedTask(activity); setShowDetailsModal(true); }} className="p-2 border-0 rounded-circle text-primary">
                  <EyeIcon style={{ width: '1rem', height: '1rem' }} />
                </Button>
              </OverlayTrigger>
            </div>
          )) : (<div className="text-center py-5 text-muted small italic">No recent activities found</div>)}
        </div>
      </div>

      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-4 shadow-lg border-0 d-flex align-items-center gap-3 text-white" 
            style={{ zIndex: 1060, backgroundColor: '#2563eb', minWidth: '240px' }}>
            <ClipboardDocumentListIcon style={{ width: '1.25rem', height: '1.25rem', opacity: 0.8 }} />
            <div className="flex-grow-1">
              <p className="h6 fw-bold mb-0 text-capitalize">{toast.title}</p>
              <p className="small mb-0 opacity-80">{toast.value}</p>
            </div>
            <XMarkIcon className="cursor-pointer" style={{ width: '1rem', height: '1rem' }} onClick={() => setToast(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="md">
        {selectedTask && (
          <div className="modal-content border-0 overflow-hidden rounded-4">
            <Modal.Header className="border-0 p-4 pb-0 d-flex flex-column align-items-start position-relative overflow-hidden" 
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #312e81 100%)' }}>
              <div className="d-flex justify-content-between w-100 mb-2">
                <h5 className="modal-title fw-bold text-white">Task Details</h5>
                <Button variant="link" className="text-white p-0 border-0 shadow-none" onClick={() => setShowDetailsModal(false)}><XMarkIcon style={{ width: '1.5rem', height: '1.5rem' }} /></Button>
              </div>
              <div className="d-flex flex-wrap gap-3 mb-3">
                <div className="small text-white-50 d-flex align-items-center gap-1">
                  <UserIcon style={{ width: '0.875rem' }} /> 
                  Created By: {selectedTask.assignedBy} {selectedTask.createdByRole ? `(${selectedTask.createdByRole.replace(/_/g, ' ')})` : ''}
                </div>
                <div className="small text-white-50 d-flex align-items-center gap-1">
                  <UserIcon style={{ width: '0.875rem' }} /> 
                  Assigned To: {selectedTask.assignedTo} {selectedTask.assignedToRole ? `(${selectedTask.assignedToRole.replace(/_/g, ' ')})` : ''}
                </div>
                <div className="small text-white-50 d-flex align-items-center gap-1">
                  <CalendarIcon style={{ width: '0.875rem' }} /> 
                  {new Date(selectedTask.createdAt || Date.now()).toLocaleDateString('en-GB')}
                </div>
              </div>
            </Modal.Header>
            <Modal.Body className="p-4">
              <div className="mb-4">
                <div className="small text-muted mb-1 text-uppercase fw-bold tracking-wider" style={{ fontSize: '0.65rem' }}>Task Title</div>
                <h6 className="fw-bold text-dark">{selectedTask.title}</h6>
              </div>
              
              <Row className="g-3 mb-4">
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Priority</div>
                    <Badge bg={getPriorityColor(selectedTask.priority)} className="rounded-pill px-2 py-1 uppercase" style={{ fontSize: '0.6rem' }}>{selectedTask.priority}</Badge>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Status</div>
                    <Badge bg={getStatusColor(selectedTask.status) === 'orange' ? '' : getStatusColor(selectedTask.status)} className={`rounded-pill px-2 py-1 uppercase ${getStatusColor(selectedTask.status) === 'orange' ? 'bg-orange' : ''}`} style={{ fontSize: '0.6rem' }}>{selectedTask.status}</Badge>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Due Date</div>
                    <span className="small fw-bold">{new Date(selectedTask.dueDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="bg-light p-3 rounded-3 h-100">
                    <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Progress</div>
                    <span className="small fw-bold text-primary">{selectedTask.progress || 0}%</span>
                    <ProgressBar now={selectedTask.progress || 0} style={{ height: '4px', marginTop: '4px' }} className="rounded-pill" />
                  </div>
                </Col>
              </Row>
              
              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Description</div>
                <p className="small text-dark mb-0">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="small text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Remarks History</div>
                {selectedTask.remarks?.length > 0 ? (
                  <div className="vstack gap-2 overflow-auto pr-1" style={{ maxHeight: '150px' }}>
                    {selectedTask.remarks.map((r, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-2 border small border-light-subtle">
                        {r.remark || r}
                      </div>
                    ))}
                  </div>
                ) : <p className="small text-muted italic mb-0">No remarks yet.</p>}
              </div>
              
              {selectedTask.attachments?.length > 0 && (
                <div className="bg-light p-3 rounded-3 mb-4">
                  <div className="small text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Attachments</div>
                  <div className="vstack gap-2">
                    {selectedTask.attachments.map((file, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-light-subtle">
                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                          <PaperClipIcon style={{ width: '1rem', height: '1rem' }} className="text-secondary flex-shrink-0" />
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="small text-primary text-truncate text-decoration-none fw-medium">
                            {file.name}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button variant="danger" className="w-100 py-3 fw-bold rounded-3 border-0 transition-all text-white" onClick={() => setShowDetailsModal(false)}>
                Close Details
              </Button>
            </Modal.Body>
          </div>
        )}
      </Modal>


    </div>
  );
};

export default Dashboard;