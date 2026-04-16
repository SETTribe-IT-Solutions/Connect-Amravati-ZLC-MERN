import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, addUser, updateUser } from '../../../services/users/userService';
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import {
  UserPlusIcon, MagnifyingGlassIcon, FunnelIcon,
  ShieldCheckIcon, UserCircleIcon, XMarkIcon, TrophyIcon,
  EyeIcon, CheckCircleIcon, EyeSlashIcon, PencilIcon
} from '@heroicons/react/24/outline';
import Pagination from '../../common/Pagination';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Modal, ProgressBar } from 'react-bootstrap';

const UserManagementComponent = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [showTooltip, setShowTooltip] = useState({ visible: false, message: '', x: 0, y: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const showToast = (title, value) => { setToast({ title, value }); setTimeout(() => setToast(null), 3000); };
  const showIconTooltip = (message, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowTooltip({ visible: true, message, x: rect.left + rect.width / 2, y: rect.top - 10 });
    setTimeout(() => setShowTooltip({ visible: false, message: '', x: 0, y: 0 }), 1500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const requesterId = user?.userID;
      const data = await getAllUsers(requesterId);
      const revRoleMap = {
        'COLLECTOR': 'Collector', 'ADDITIONAL_DEPUTY_COLLECTOR': 'Addl. Collector', 'SDO': 'SDO',
        'TEHSILDAR': 'Tehsildar', 'BDO': 'BDO', 'TALATHI': 'Talathi', 'GRAMSEVAK': 'Gram Sevak', 'SYSTEM_ADMINISTRATOR': 'Admin'
      };
      const mapped = (data || []).map(u => ({
        id: u.userID, name: u.name || 'Unknown', role: revRoleMap[u.role?.toUpperCase()] || u.role || 'User',
        email: u.email || 'N/A', phone: u.phone || '+91 00000 00000', village: u.village || '', taluka: u.taluka || '',
        district: u.district || '', jurisdiction: u.village ? `${u.village}, ${u.taluka}` : (u.taluka || u.district || 'Amravati'),
        status: u.active ? 'Active' : 'Inactive', avatar: (u.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2),
        joinDate: u.createdAt ? u.createdAt.toString().split('T')[0] : 'N/A',
        createdAt: u.createdAt || new Date().toISOString(),
        _rawActive: u.active
      }));
      setUsers(mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) { console.error("Fetch Users Error:", error); } finally { setLoading(false); }
  }, []);

  const fetchTalukas = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/talukas", { withCredentials: true });
      setTalukas(response.data.map(t => (t?.taluka ?? t)).filter(Boolean));
    } catch (error) { console.error("Fetch Talukas Error:", error); }
  }, []);

  useEffect(() => { fetchUsers(); fetchTalukas(); }, [fetchUsers, fetchTalukas]);

  const fetchVillages = useCallback(async (talukaName) => {
    if (!talukaName) { setVillages([]); return; }
    try {
      const response = await axios.get(`http://localhost:8080/api/villages/${encodeURIComponent(talukaName)}`, { withCredentials: true });
      setVillages(response.data.map(v => (v?.village ?? v)).filter(Boolean));
    } catch (error) { console.error("Fetch Villages Error:", error); setVillages([]); }
  }, []);

  const roles = ['Collector', 'Addl. Collector', 'SDO', 'Tehsildar', 'BDO', 'Talathi', 'Gram Sevak', 'Admin'];
  const stats = [
    { label: 'Total Users', value: users.length, icon: UserCircleIcon, color: 'primary', msg: 'Total Users Count' },
    { label: 'Active Users', value: users.filter(u => u.status === 'Active').length, icon: ShieldCheckIcon, color: 'success', msg: 'Currently Active Users' },
    { label: 'New This Month', value: users.filter(u => new Date(u.joinDate).getMonth() === new Date().getMonth()).length, icon: TrophyIcon, color: 'info', msg: 'New Users This Month' }
  ];

  const getRoleColor = (role) => ({
    'Collector': 'secondary', 'Addl. Collector': 'dark',
    'SDO': 'primary', 'Tehsildar': 'success',
    'BDO': 'warning', 'Talathi': 'danger',
    'Gram Sevak': 'info', 'Admin': 'secondary'
  }[role] || 'secondary');

  const filteredUsers = users.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || user.role === roleFilter)
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3" style={{ width: 'auto', minWidth: '300px' }}>
            <Card className="shadow-lg border-0 bg-primary text-white p-3 rounded-4">
              <div className="d-flex align-items-center gap-3">
                <CheckCircleIcon style={{ width: '1.5rem' }} />
                <div>
                  <p className="small mb-0 opacity-75">{toast.title}</p>
                  <p className="fw-bold mb-0">{toast.value}</p>
                </div>
                <Button variant="link" className="text-white ms-auto p-0" onClick={() => setToast(null)}><XMarkIcon style={{ width: '1rem' }} /></Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">User Management</h1>
          <p className="text-secondary small mb-0">Manage users, roles, and permissions across all departments</p>
        </div>
        <Button variant="primary" className="fw-bold px-4 py-2 rounded-3 shadow-sm" onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}>
          <UserPlusIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} /> Add User
        </Button>
      </div>

      <Row className="g-3 mb-4">
        {stats.map((stat, index) => (
          <Col key={stat.label} xs={12} sm={4}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="premium-card border-0 p-3 h-100 shadow-sm shadow-hover cursor-pointer" onClick={() => showToast(stat.label, stat.value)}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="small text-secondary fw-bold mb-1">{stat.label}</p>
                    <p className="h3 fw-bold mb-0">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-3 bg-${stat.color} bg-opacity-10 text-${stat.color}`}>
                    <stat.icon style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Card className="premium-card border-0 p-4 mb-4">
        <Row className="g-3">
          <Col md={8}>
            <div className="position-relative">
              <MagnifyingGlassIcon className="position-absolute translate-middle-y text-secondary" style={{ width: '1.25rem', left: '0.75rem', top: '50%', zIndex: 10 }} />
              <Form.Control type="text" placeholder="Search users by name, email, or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rounded-3 border-light-subtle ps-5 py-2" />
            </div>
          </Col>
          <Col md={4}>
            <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-3 border-light-subtle py-2">
              <option value="all">All Roles</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-secondary fw-medium">Loading user data...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
          <div className="p-4 bg-light rounded-circle d-inline-block mb-3">
            <UserCircleIcon style={{ width: '3rem' }} className="text-secondary opacity-50" />
          </div>
          <h3 className="h5 fw-bold text-dark">No Users Found</h3>
          <p className="text-secondary small mb-0">No users match your search criteria.</p>
        </div>
      </div>

      {loading ? <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-gray-500 font-medium">Loading user data...</p>
      </div> : filteredUsers.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4"><UserCircleIcon className="h-10 w-10 text-blue-300" /></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3><p className="text-gray-500 max-w-sm mx-auto">No users match your search criteria.</p>
      </div> : <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200"><tr>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
             <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Jurisdiction</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map(user => <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
            <td className="py-3 px-4"><div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">{user.avatar}</div>
              <p className="font-medium text-gray-800 text-sm">{user.name}</p>
            </div></td>
            <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getRoleColor(user.role)}`}>{user.role}</span></td>
            <td className="py-3 px-4"><p className="text-sm text-gray-600 truncate max-w-[180px]">{user.email}</p>
            <p className="text-xs text-gray-500"></p></td>
             <td className="py-3 px-4"><p className="text-sm text-gray-600 truncate max-w-[180px]"></p>
            <p className="text-xs text-gray-500">{user.phone}</p></td>
            <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[150px]">{user.jurisdiction}</td>
            <td className="py-3  px-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>{user.status}
            </span></td>
            <td className="py-3 px-4"><div className="flex gap-2">
              <button onMouseEnter={(e) => showIconTooltip('View User Details', e)} onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg">
                <EyeIcon className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </button>
            </div></td>
          </tr>)}</tbody>
        </table></div>
        <Pagination 
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>}

      <AnimatePresence>{isModalOpen && <UserModal user={selectedUser} allUsers={users} roles={roles} talukas={talukas} villages={villages}
        fetchVillages={fetchVillages} showIconTooltip={showIconTooltip}
        onClose={() => { setShowCloseConfirm(true); }}
        onConfirmClose={() => { setIsModalOpen(false); setSelectedUser(null); setVillages([]); setShowCloseConfirm(false); }}
        onCancelClose={() => setShowCloseConfirm(false)}
        onSave={async (userData) => {
          try {
            const roleMap = { 'Collector': 'COLLECTOR', 'Addl. Collector': 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO': 'SDO', 'Tehsildar': 'TEHSILDAR', 'BDO': 'BDO', 'Talathi': 'TALATHI', 'Gram Sevak': 'GRAMSEVAK', 'Admin': 'SYSTEM_ADMINISTRATOR' };
            const payload = { ...userData, role: roleMap[userData.role] || userData.role, requesterId: user?.userID || '', active: userData.status === 'Active' };
            delete payload.status;
            
            if (selectedUser) {
              delete payload.userID; // NOT present in UpdateUserRequest DTO
              if (!payload.password) delete payload.password;
              await updateUser(selectedUser.id, payload);
            } else {
              await addUser(payload);
            }
          }} 
        />
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showCloseConfirm} onHide={() => setShowCloseConfirm(false)} centered size="sm">
        <Modal.Body className="p-4 text-center">
          <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
            <XMarkIcon style={{ width: '2rem', height: '2rem' }} className="text-danger" />
          </div>
          <h6 className="fw-bold mb-1">Confirm Close</h6>
          <p className="small text-muted mb-4">Do you want to close without saving?</p>
          <div className="d-flex gap-2">
            <Button variant="light" className="flex-grow-1 small py-2 rounded-3 border fw-semibold" onClick={() => setShowCloseConfirm(false)}>No</Button>
            <Button variant="danger" className="flex-grow-1 small py-2 rounded-3 fw-semibold shadow-sm" onClick={() => { setIsModalOpen(false); setSelectedUser(null); setVillages([]); setShowCloseConfirm(false); }}>Yes, Close</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const UserModal = ({ user, allUsers, roles, talukas, villages, fetchVillages, onClose, onSave }) => {
  const roleLimits = {
    'Collector': 1, 'Addl. Collector': 8, 'SDO': 6, 'Tehsildar': 30, 'BDO': 14, 'Talathi': 600, 'Gram Sevak': 900, 'Admin': Infinity
  };

  const [isEditing, setIsEditing] = useState(!user);
  const [formData, setFormData] = useState({
    id: user?.id || '',
    userID: user?.id || '', 
    name: user?.name || '', 
    email: user?.email || '',
    phone: (user?.phone || '').replace(/\D/g, '').slice(0, 10), 
    role: user?.role || '',
    district: user?.district || 'Amravati', 
    taluka: user?.taluka || '', 
    village: user?.village || '',
    status: user?.status || 'Active', 
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.taluka) fetchVillages(user.taluka);
  }, [user, fetchVillages]);

  const availableRoles = roles.filter(role => {
    if (user && user.role === role) return true;
    const count = allUsers ? allUsers.filter(u => u.role === role && u.status === 'Active').length : 0;
    return count < (roleLimits[role] || Infinity);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.userID) newErrors.userID = "User ID is required";
    if (!formData.name) newErrors.name = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid 10-digit phone number";
    
    if (!user && !formData.password) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 8) newErrors.password = "Min 8 characters required";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    // Role Limit Check
    if (formData.status === 'Active' && (!user || user.status !== 'Active' || user.role !== formData.role)) {
      const count = allUsers.filter(u => u.role === formData.role && u.status === 'Active').length;
      if (count >= roleLimits[formData.role]) {
        setErrors({ role: `Limit reached for ${formData.role} role.` });
        return;
      }
    }

    onSave(formData);
  };

  if (user && !isEditing) {
    return (
      <div className="modal-content border-0 overflow-hidden rounded-4">
        <Modal.Header className="bg-primary text-white border-0 p-4">
          <Modal.Title className="fw-bold">User Details</Modal.Title>
          <Button variant="link" className="text-white p-0" onClick={onClose}><XMarkIcon style={{ width: '1.5rem' }} /></Button>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-4 mb-4">
            <Col xs={6}>
              <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>User ID</div>
              <p className="fw-bold text-dark mb-0">{user.id}</p>
            </Col>
            <Col xs={6}>
              <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Full Name</div>
              <p className="fw-bold text-dark mb-0">{user.name}</p>
            </Col>
            <Col xs={6}>
              <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Email</div>
              <p className="fw-medium text-dark mb-0">{user.email}</p>
            </Col>
            <Col xs={6}>
              <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Phone</div>
              <p className="fw-medium text-dark mb-0">{user.phone}</p>
            </Col>
            <Col xs={6}>
              <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Role</div>
              <Badge bg="primary" className="rounded-pill">{user.role}</Badge>
            </Col>
            <Col xs={6}>
              <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Status</div>
              <Badge bg={user.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill">{user.status}</Badge>
            </Col>
            <Col xs={12}>
              <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Jurisdiction</div>
              <p className="fw-medium text-dark mb-0">{user.jurisdiction}</p>
            </Col>
          </Row>
          <div className="d-flex gap-2">
            <Button variant="primary" className="flex-grow-1 fw-bold rounded-3" onClick={() => setIsEditing(true)}>
              <PencilIcon style={{ width: '1.1rem', marginRight: '0.5rem' }} /> Edit User
            </Button>
            <Button variant="light" className="flex-grow-1 fw-bold rounded-3" onClick={onClose}>Close</Button>
          </div>
        </Modal.Body>
      </div>
    );
  }

  return (
    <div className="modal-content border-0 overflow-hidden rounded-4">
      <Modal.Header className="bg-primary text-white border-0 p-4">
        <Modal.Title className="fw-bold">{user ? 'Edit User' : 'Add New User'}</Modal.Title>
        <Button variant="link" className="text-white p-0" onClick={onClose}><XMarkIcon style={{ width: '1.5rem' }} /></Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">User ID (Digits) *</Form.Label>
                <Form.Control type="text" disabled={!!user} value={formData.userID} isInvalid={!!errors.userID} 
                  onChange={(e) => setFormData({...formData, userID: e.target.value.replace(/\D/g, '')})} className="rounded-3 border-light-subtle" />
                <Form.Control.Feedback type="invalid">{errors.userID}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Full Name *</Form.Label>
                <Form.Control type="text" value={formData.name} isInvalid={!!errors.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-3 border-light-subtle" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Email *</Form.Label>
                <Form.Control type="email" value={formData.email} isInvalid={!!errors.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-3 border-light-subtle" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Phone (10-digit) *</Form.Label>
                <Form.Control type="tel" value={formData.phone} isInvalid={!!errors.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="rounded-3 border-light-subtle" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Role *</Form.Label>
                <Form.Select value={formData.role} isInvalid={!!errors.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="rounded-3 border-light-subtle">
                  <option value="">Select Role</option>
                  {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Status</Form.Label>
                <Form.Select disabled={!user} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="rounded-3 border-light-subtle">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">District</Form.Label>
                <Form.Control type="text" value={formData.district} readOnly className="rounded-3 bg-light border-light-subtle" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Taluka</Form.Label>
                <Form.Select value={formData.taluka} onChange={(e) => { setFormData({...formData, taluka: e.target.value, village: ''}); fetchVillages(e.target.value); }} className="rounded-3 border-light-subtle">
                  <option value="">Select Taluka</option>
                  {talukas.map(t => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Village</Form.Label>
                <Form.Select value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} className="rounded-3 border-light-subtle">
                  <option value="">Select Village</option>
                  {villages.map(v => <option key={v} value={v}>{v}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="position-relative">
                <Form.Label className="small fw-bold text-secondary">{user ? 'New Password (Optional)' : 'Password *'}</Form.Label>
                <Form.Control type={showPassword ? "text" : "password"} value={formData.password} isInvalid={!!errors.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} className="rounded-3 border-light-subtle pe-5" />
                <Button variant="link" className="position-absolute end-0 top-50 translate-middle-y text-secondary p-2 mt-2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlashIcon style={{ width: '1.25rem' }} /> : <EyeIcon style={{ width: '1.25rem' }} />}
                </Button>
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex gap-2 mt-4">
            <Button variant="primary" type="submit" className="flex-grow-1 fw-bold rounded-3 py-2 shadow-sm">
              {user ? 'Update User' : 'Create User'}
            </Button>
            <Button variant="light" className="flex-grow-1 fw-bold rounded-3 py-2 border" onClick={onClose}>Cancel</Button>
          </div>
        </Form>
      </Modal.Body>
    </div>
  );
};

export default UserManagementComponent;