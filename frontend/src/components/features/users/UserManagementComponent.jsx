import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, addUser, updateUser, getUserStats } from '../../../services/users/userService';
import { getTalukas, getVillagesByTaluka } from '../../../services/common/locationService';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [statFilter, setStatFilter] = useState('Total Users');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, newUsersThisMonth: 0 });
  const [activeFilter, setActiveFilter] = useState(null); // null (all), true (active), false (inactive)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, roleFilter, activeFilter]);

  const showToast = (title, value) => { setToast({ title, value }); setTimeout(() => setToast(null), 3000); };
  const showIconTooltip = (message, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowTooltip({ visible: true, message, x: rect.left + rect.width / 2, y: rect.top - 10 });
    setTimeout(() => setShowTooltip({ visible: false, message: '', x: 0, y: 0 }), 1500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const roleMap = {
        'Collector': 'COLLECTOR', 'Addl. Collector': 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO': 'SDO',
        'Tehsildar': 'TEHSILDAR', 'BDO': 'BDO', 'Talathi': 'TALATHI', 'Gram Sevak': 'GRAMSEVAK', 'Admin': 'SYSTEM_ADMINISTRATOR'
      };

      const params = {
          page: currentPage - 1,
          size: itemsPerPage,
          requesterId: user?.userID,
          searchTerm: debouncedSearchTerm,
          role: roleFilter !== 'all' ? roleMap[roleFilter] : null,
          active: activeFilter
      };

      const data = await getAllUsers(params);
      
      const revRoleMap = {
        'COLLECTOR': 'Collector', 'ADDITIONAL_DEPUTY_COLLECTOR': 'Addl. Collector', 'SDO': 'SDO',
        'TEHSILDAR': 'Tehsildar', 'BDO': 'BDO', 'TALATHI': 'Talathi', 'GRAMSEVAK': 'Gram Sevak', 'SYSTEM_ADMINISTRATOR': 'Admin'
      };

      const mapped = (data.content || []).map(u => ({
        id: u.userID, name: u.name || 'Unknown', role: revRoleMap[u.role?.toUpperCase()] || u.role || 'User',
        email: u.email || 'N/A', phone: u.phone || '+91 00000 00000', village: u.village || '', taluka: u.taluka || '',
        district: u.district || '', jurisdiction: u.village ? `${u.village}, ${u.taluka}` : (u.taluka || u.district || 'Amravati'),
        status: u.active ? 'Active' : 'Inactive', avatar: (u.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2),
        joinDate: u.createdAt ? u.createdAt.toString().split('T')[0] : 'N/A',
        lastLogin: u.lastLogin,
        lastLoginIP: u.lastLoginIP || 'N/A',
        lastLoginDevice: u.lastLoginDevice || 'N/A',
        createdAt: u.createdAt || new Date().toISOString(),
        _rawActive: u.active
      }));

      setUsers(mapped);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalElements || 0);

    } catch (error) { 
        console.error("Fetch Users Error:", error); 
    } finally { 
        setLoading(false); 
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, roleFilter, activeFilter, user?.userID]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getUserStats();
      setGlobalStats(data);
    } catch (error) {
      console.error("Fetch Stats Error:", error);
    }
  }, []);

  const fetchTalukas = useCallback(async () => {
    try {
      const data = await getTalukas();
      setTalukas(data);
    } catch (error) { console.error("Fetch Talukas Error:", error); }
  }, []);

  useEffect(() => { 
    fetchUsers(); 
    fetchStats();
    fetchTalukas(); 
  }, [fetchUsers, fetchStats, fetchTalukas]);
 
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setVillages([]);
  };

  const fetchVillages = useCallback(async (talukaName) => {
    if (!talukaName) { setVillages([]); return; }
    try {
      const data = await getVillagesByTaluka(talukaName);
      setVillages(data);
    } catch (error) { console.error("Fetch Villages Error:", error); setVillages([]); }
  }, []);

  const roles = ['Collector', 'Addl. Collector', 'SDO', 'Tehsildar', 'BDO', 'Talathi', 'Gram Sevak', 'Admin'];
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newUsersCount = users.filter(u => {
    if (!u.createdAt) return false;
    const date = new Date(u.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const stats = [
    { label: 'Total Users', value: globalStats.totalUsers, icon: UserCircleIcon, color: 'primary', msg: 'Total Users Count', filter: null },
    { label: 'Active Users', value: globalStats.activeUsers, icon: ShieldCheckIcon, color: 'success', msg: 'Currently Active Users', filter: true },
    { label: 'Inactive Users', value: globalStats.inactiveUsers, icon: EyeSlashIcon, color: 'danger', msg: 'Currently Inactive Users', filter: false },
    { label: 'New Users this Month', value: globalStats.newUsersThisMonth, icon: UserPlusIcon, color: 'info', msg: 'New Users Added This Month', filter: 'new' }
  ];

  const filteredUsersList = users; // Filtering is now handled on the backend

  const getRoleColor = (role) => ({
    'Collector': 'secondary', 'Addl. Collector': 'dark',
    'SDO': 'primary', 'Tehsildar': 'success',
    'BDO': 'warning', 'Talathi': 'danger',
    'Gram Sevak': 'info', 'Admin': 'secondary'
  }[role] || 'secondary');

  return (
    <div className="p-4 bg-light min-vh-100">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ width: 'auto', minWidth: '300px', zIndex: 9999 }}>
            <Card className="shadow-lg border-0 bg-primary text-white p-3 rounded-4">
              <div className="d-flex align-items-center gap-3">
                <CheckCircleIcon style={{ width: '1.5rem' }} />
                <div>
                  <p className={`mb-0 ${toast.value ? 'small opacity-75' : 'fw-bold'}`}>{toast.title}</p>
                  {toast.value && <p className="fw-bold mb-0">{toast.value}</p>}
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
          <Col key={stat.label} xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card 
                className={`premium-card border-0 p-3 h-100 shadow-sm shadow-hover ${statFilter === stat.label ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{ cursor: 'pointer', transform: statFilter === stat.label ? 'translateY(-2px)' : 'none', border: statFilter === stat.label ? '2px solid #0d6efd' : 'none' }}
                onClick={() => {
                  setStatFilter(stat.label);
                  if (stat.filter === 'new') {
                    // Handled locally since it's a specific date range, 
                    // or could be a separate backend filter. 
                    // For now, let's just stick to the basic Active/Inactive/Total.
                    setActiveFilter(null);
                  } else {
                    setActiveFilter(stat.filter);
                  }
                  showToast(stat.label, '');
                }}
              >
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
          <Col lg={2} md={3}>
            <div className="d-flex align-items-center gap-2">
              <Form.Control 
                type="number" 
                min="1" 
                value={itemsPerPage} 
                onChange={(e) => { 
                  const val = parseInt(e.target.value, 10); 
                  if (!isNaN(val) && val > 0) { setItemsPerPage(val); setCurrentPage(1); } 
                  else if (e.target.value === '') { setItemsPerPage(''); }
                }} 
                onBlur={() => { if (itemsPerPage === '' || itemsPerPage < 1) { setItemsPerPage(10); setCurrentPage(1); } }}
                className="rounded-3 border-light-subtle py-2 text-center" 
              />
              <span className="small text-secondary fw-medium text-nowrap">per page</span>
            </div>
          </Col>
          <Col lg={7} md={5}>
            <div className="position-relative">
              <MagnifyingGlassIcon className="position-absolute translate-middle-y text-secondary" style={{ width: '1.25rem', left: '0.75rem', top: '50%', zIndex: 10 }} />
              <Form.Control type="text" placeholder="Search users by name, number, role, jurisdiction..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rounded-3 border-light-subtle ps-5 py-2" />
            </div>
          </Col>
          <Col lg={3} md={4}>
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
      ) : filteredUsersList.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
          <div className="p-4 bg-light rounded-circle d-inline-block mb-3">
            <UserCircleIcon style={{ width: '3rem' }} className="text-secondary opacity-50" />
          </div>
          <h3 className="h5 fw-bold text-dark">No Users Found</h3>
          <p className="text-secondary small mb-0">No users match your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary">User</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary">Role</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary">Email</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary">Contact</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary">Jurisdiction</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary">Last Login</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary text-center">Status</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-secondary text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsersList.map(member => (
                    <tr key={member.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px', fontSize: '0.8rem' }}>
                            {member.avatar}
                          </div>
                          <p className="fw-bold text-dark mb-0 small">{member.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg={getRoleColor(member.role)} className="rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="small text-muted mb-0">{member.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="small text-muted mb-0">{member.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="small text-muted mb-0 truncate" style={{ maxWidth: '150px' }}>{member.jurisdiction}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="small text-dark fw-medium mb-0">{member.lastLogin ? new Date(member.lastLogin).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge bg={member.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                          {member.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="p-2 rounded-circle hover-bg-primary-soft border-0"
                            onClick={() => { setSelectedUser(member); setIsEditing(false); setIsModalOpen(true); }}
                          >
                            <EyeIcon style={{ width: '1.1rem' }} className="text-primary" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
          <div className="p-3 border-top">
            <Pagination 
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      <Modal 
        show={isModalOpen} 
        onHide={handleCloseModal} 
        centered 
        size="lg"
        contentClassName="border-0 rounded-4 shadow-lg"
      >
        <UserModal 
          user={selectedUser} 
          initialIsEditing={isEditing} 
          allUsers={users} 
          roles={roles} 
          talukas={talukas} 
          villages={villages}
          fetchVillages={fetchVillages} 
          showIconTooltip={showIconTooltip}
          onClose={handleCloseModal}
          onSave={async (userData) => {
          try {
            const roleMap = { 'Collector': 'COLLECTOR', 'Addl. Collector': 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO': 'SDO', 'Tehsildar': 'TEHSILDAR', 'BDO': 'BDO', 'Talathi': 'TALATHI', 'Gram Sevak': 'GRAMSEVAK', 'Admin': 'SYSTEM_ADMINISTRATOR' };
            const payload = { ...userData, role: roleMap[userData.role] || userData.role, requesterId: user?.userID || '', active: userData.status === 'Active' };
            delete payload.status;
            
            if (selectedUser) {
              delete payload.userID; // NOT present in UpdateUserRequest DTO
              if (!payload.password) delete payload.password;
              await updateUser(selectedUser.id, payload);
              showToast("Success", "User updated successfully");
            } else {
              await addUser(payload);
              showToast("Success", "User added successfully");
            }
            setIsModalOpen(false);
            fetchUsers();
            fetchStats();
          } catch (error) {
            console.error("Save User Error:", error);
            showToast("Error", error.response?.data?.message || "Failed to save user");
          }
        }} 
      />
    </Modal>
    </div>
  );
};

const UserModal = ({ user, initialIsEditing, allUsers, roles, talukas, villages, fetchVillages, onClose, onSave }) => {
  const roleLimits = {
    'Collector': 1, 'Addl. Collector': 2, 'SDO': 6, 'Tehsildar': 14, 'BDO': 14, 'Talathi': 600, 'Gram Sevak': 900, 'Admin': 1
  };

  const [isEditing, setIsEditing] = useState(initialIsEditing);
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

  const mandatoryTalukaRoles = ['Tehsildar', 'BDO', 'Talathi', 'Gram Sevak'];
  const isTalukaMandatory = mandatoryTalukaRoles.includes(formData.role);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g., abc@gmail.com)";
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits";
    }
    
    if (!user && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password) {
      const pwd = formData.password;
      if (pwd.length < 8) newErrors.password = "Minimum 8 characters required";
      else if (!/(?=.*[A-Z])/.test(pwd)) newErrors.password = "Must contain at least one uppercase letter (A-Z)";
      else if (!/(?=.*[a-z])/.test(pwd)) newErrors.password = "Must contain at least one lowercase letter (a-z)";
      else if (!/(?=.*\d)/.test(pwd)) newErrors.password = "Must contain at least one number (0-9)";
      else if (!/(?=.*[@$!%*?&])/.test(pwd)) newErrors.password = "Must contain at least one special character (@, $, !, %, *, ?, &)";
    }

    if (isTalukaMandatory && !formData.taluka) {
      newErrors.taluka = "Taluka is required for this role";
    }

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
          <Button variant="link" className="text-white p-0 ms-auto" onClick={onClose}><XMarkIcon style={{ width: '1.5rem' }} /></Button>
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
            <Col xs={12}>
               <hr className="my-2 opacity-10" />
               <div className="bg-light p-3 rounded-3 border">
                 <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                    <CheckCircleIcon style={{ width: '1.1rem' }} />
                    <span className="small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Login Tracking</span>
                 </div>
                 <Row className="g-3">
                   <Col xs={12}>
                     <div className="small text-muted mb-1" style={{ fontSize: '0.65rem' }}>LAST LOGIN TIME</div>
                     <p className="fw-bold text-dark mb-0">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) : 'No login recorded yet'}</p>
                   </Col>
                   <Col sm={6}>
                     <div className="small text-muted mb-1" style={{ fontSize: '0.65rem' }}>IP ADDRESS</div>
                     <p className="small fw-medium text-dark mb-0">{user.lastLoginIP || 'N/A'}</p>
                   </Col>
                   <Col sm={6}>
                     <div className="small text-muted mb-1" style={{ fontSize: '0.65rem' }}>DEVICE / BROWSER</div>
                     <p className="small fw-medium text-dark mb-0 text-truncate" title={user.lastLoginDevice}>{user.lastLoginDevice || 'N/A'}</p>
                   </Col>
                 </Row>
               </div>
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
        <Button variant="link" className="text-white p-0 ms-auto" onClick={onClose}><XMarkIcon style={{ width: '1.5rem' }} /></Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">User ID <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" placeholder="Enter ID number" disabled={!!user} value={formData.userID} isInvalid={!!errors.userID} 
                  onChange={(e) => setFormData({...formData, userID: e.target.value.replace(/\D/g, '')})} className="rounded-3 border-light-subtle" />
                <Form.Control.Feedback type="invalid">{errors.userID}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Full Name <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" placeholder="Enter your full name" value={formData.name} isInvalid={!!errors.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-3 border-light-subtle" />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Email <span className="text-danger">*</span></Form.Label>
                <Form.Control type="email" placeholder="e.g., abc@gmail.com" value={formData.email} isInvalid={!!errors.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-3 border-light-subtle" />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Phone Number <span className="text-danger">*</span></Form.Label>
                <Form.Control type="tel" placeholder="Enter 10-digit number" value={formData.phone} isInvalid={!!errors.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="rounded-3 border-light-subtle" />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Role <span className="text-danger">*</span></Form.Label>
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
                <Form.Label className="small fw-bold text-secondary">Taluka {isTalukaMandatory && <span className="text-danger">*</span>}</Form.Label>
                <Form.Select value={formData.taluka} isInvalid={!!errors.taluka} onChange={(e) => { setFormData({...formData, taluka: e.target.value, village: ''}); fetchVillages(e.target.value); }} className="rounded-3 border-light-subtle">
                  <option value="">Select Taluka</option>
                  {talukas.map(t => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.taluka}</Form.Control.Feedback>
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
                <Form.Label className="small fw-bold text-secondary">{user ? 'New Password (Optional)' : <>Password <span className="text-danger">*</span></>}</Form.Label>
                <Form.Control type={showPassword ? "text" : "password"} placeholder="Password must contain 1 upper letter, 1 lower letter, 1 special character and 1 number (min 8 chars)" value={formData.password} isInvalid={!!errors.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} className="rounded-3 border-light-subtle pe-5" style={{ backgroundImage: 'none' }} />
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