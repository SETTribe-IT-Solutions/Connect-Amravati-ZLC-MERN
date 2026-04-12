import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, addUser, updateUser, deleteUser } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import {
  UserPlusIcon, MagnifyingGlassIcon, FunnelIcon,
  ShieldCheckIcon, UserCircleIcon, XMarkIcon, TrophyIcon,
  EyeIcon, CheckCircleIcon, EyeSlashIcon, PencilIcon
} from '@heroicons/react/24/outline';

const UserManagementComponent = () => {
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

  const showToast = (title, value) => { setToast({ title, value }); setTimeout(() => setToast(null), 3000); };
  const showIconTooltip = (message, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowTooltip({ visible: true, message, x: rect.left + rect.width / 2, y: rect.top - 10 });
    setTimeout(() => setShowTooltip({ visible: false, message: '', x: 0, y: 0 }), 1500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const requesterId = localStorage.getItem('userID') || null;
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
        createdAt: u.createdAt || new Date().toISOString()
      }));
      setUsers(mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) { console.error("Fetch Users Error:", error); } finally { setLoading(false); }
  }, []);



  const fetchTalukas = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/talukas", { headers: { Authorization: `Bearer ${token}` } });
      setTalukas(response.data.map(t => (t?.taluka ?? t)).filter(Boolean));
    } catch (error) { console.error("Fetch Talukas Error:", error); }
  }, []);

  useEffect(() => { fetchUsers(); fetchTalukas(); }, [fetchUsers, fetchTalukas]);

  const fetchVillages = useCallback(async (talukaName) => {
    if (!talukaName) { setVillages([]); return; }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/villages/${encodeURIComponent(talukaName)}`, { headers: { Authorization: `Bearer ${token}` } });
      setVillages(response.data.map(v => (v?.village ?? v)).filter(Boolean));
    } catch (error) { console.error("Fetch Villages Error:", error); setVillages([]); }
  }, []);

  const roles = ['Collector', 'Addl. Collector', 'SDO', 'Tehsildar', 'BDO', 'Talathi', 'Gram Sevak', 'Admin'];
  const stats = [
    { label: 'Total Users', value: users.length, icon: UserCircleIcon, bgColor: 'bg-blue-50', textColor: 'text-blue-600', msg: 'Total Users Count' },
    { label: 'Active Users', value: users.filter(u => u.status === 'Active').length, icon: ShieldCheckIcon, bgColor: 'bg-green-50', textColor: 'text-green-600', msg: 'Currently Active Users' },
    { label: 'New This Month', value: users.filter(u => new Date(u.joinDate).getMonth() === new Date().getMonth()).length, icon: TrophyIcon, bgColor: 'bg-purple-50', textColor: 'text-purple-600', msg: 'New Users This Month' }
  ];

  const getRoleColor = (role) => ({
    'Collector': 'bg-purple-100 text-purple-700', 'Addl. Collector': 'bg-indigo-100 text-indigo-700',
    'SDO': 'bg-blue-100 text-blue-700', 'Tehsildar': 'bg-green-100 text-green-700',
    'BDO': 'bg-yellow-100 text-yellow-700', 'Talathi': 'bg-orange-100 text-orange-700',
    'Gram Sevak': 'bg-teal-100 text-teal-700', 'Admin': 'bg-gray-100 text-gray-700'
  }[role] || 'bg-gray-100 text-gray-700');

  const filteredUsers = users.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || user.role === roleFilter)
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <AnimatePresence>
        {toast && <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white rounded-lg shadow-lg">
          <div className="flex items-center gap-3 p-3 px-5">
            <CheckCircleIcon className="h-5 w-5 text-white/80" />
            <div><p className="text-sm font-medium">{toast.title}</p><p className="text-lg font-bold">{toast.value}</p></div>
            <button onClick={() => setToast(null)}><XMarkIcon className="h-4 w-4 text-white/70 hover:text-white" /></button>
          </div>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {showTooltip.visible && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="fixed z-50 bg-gray-900 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap pointer-events-none"
          style={{ left: showTooltip.x, top: showTooltip.y, transform: 'translateX(-50%)' }}>{showTooltip.message}</motion.div>}
      </AnimatePresence>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div><h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions across all departments</p></div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium">
            <UserPlusIcon className="h-5 w-5" /> Add User
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }} onMouseEnter={(e) => showIconTooltip(stat.msg, e)} onClick={() => showToast(stat.label, stat.value)} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 cursor-pointer">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">{stat.label}</p><p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p></div>
            <div className={`${stat.bgColor} p-2 rounded-lg`}><stat.icon className={`h-5 w-5 ${stat.textColor}`} /></div>
          </div>
        </motion.div>)}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search users by name, email, or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">All Roles</option>{roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50" onMouseEnter={(e) => showIconTooltip('Filter Users', e)}><FunnelIcon className="h-5 w-5 text-gray-600" /></button>
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
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
             <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Jurisdiction</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">{filteredUsers.map(user => <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
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
              <button onMouseEnter={(e) => showIconTooltip('View User Details', e)} onClick={(e) => { setSelectedUser(user); setIsModalOpen(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg">
                <EyeIcon className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </button>
            </div></td>
          </tr>)}</tbody>
        </table></div>
      </div>}

      <AnimatePresence>{isModalOpen && <UserModal user={selectedUser} roles={roles} talukas={talukas} villages={villages}
        fetchVillages={fetchVillages} showIconTooltip={showIconTooltip}
        onClose={() => { setShowCloseConfirm(true); }}
        onConfirmClose={() => { setIsModalOpen(false); setSelectedUser(null); setVillages([]); setShowCloseConfirm(false); }}
        onCancelClose={() => setShowCloseConfirm(false)}
        onSave={async (userData) => {
          try {
            const roleMap = { 'Collector': 'COLLECTOR', 'Addl. Collector': 'ADDITIONAL_DEPUTY_COLLECTOR', 'SDO': 'SDO', 'Tehsildar': 'TEHSILDAR', 'BDO': 'BDO', 'Talathi': 'TALATHI', 'Gram Sevak': 'GRAMSEVAK', 'Admin': 'SYSTEM_ADMINISTRATOR' };
            const payload = { ...userData, role: roleMap[userData.role] || userData.role, requesterId: localStorage.getItem('userID') || '', active: userData.status === 'Active' };
            delete payload.status;
            
            if (selectedUser) {
              delete payload.userID; // NOT present in UpdateUserRequest DTO
              if (!payload.password) delete payload.password;
              await updateUser(selectedUser.id, payload);
            } else {
              await addUser(payload);
            }
            
            fetchUsers(); setIsModalOpen(false); setSelectedUser(null);
            showToast(selectedUser ? 'User Updated' : 'User Created', 'Successfully');
          } catch (error) { 
            console.error("Save Error:", error.response?.data || error.message);
            showToast('Operation Failed', 'Please try again'); 
          }
        }} />}</AnimatePresence>

      <AnimatePresence>{showCloseConfirm && <ConfirmPopup message="Do you want to close?" onConfirm={() => { setIsModalOpen(false); setSelectedUser(null); setVillages([]); setShowCloseConfirm(false); }} onCancel={() => setShowCloseConfirm(false)} />}</AnimatePresence>
    </div>
  );
};

const UserModal = ({ user, roles, talukas, villages, fetchVillages, onClose, onConfirmClose, onCancelClose, onSave, showIconTooltip }) => {
  const [formData, setFormData] = useState({
    userID: user?.id || '', name: user?.name || '', email: user?.email || '',
    phone: (user?.phone || '').replace(/\D/g, '').slice(0, 10), role: user?.role || roles[0],
    district: user?.district || 'Amravati', taluka: user?.taluka || '', village: user?.village || '',
    status: user?.status || 'Active', password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    if (!/^\d{10}$/.test(phone)) return 'Phone number must be exactly 10 digits';
    if (!/^[6-9]/.test(phone)) return 'Phone number must start with 6, 7, 8, or 9';
    return '';
  };
  const validatePassword = (password) => {
    if (!password && !user) return 'Password is required';
    if (password && password.length < 8) return 'Password must be at least 8 characters';
    if (password && !/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (password && !/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (password && !/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (password && !/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
    return '';
  };

  
  // Initial village fetch if editing a user with an existing taluka
useEffect(() => {
  if (user?.taluka) {
    fetchVillages(user.taluka);
  }
}, [user, fetchVillages]);


  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
      if (!formData.userID) {
    newErrors.userID = "User ID is required";
  } else if (!/^\d+$/.test(formData.userID)) {
    newErrors.userID = "User ID must contain only digits";
  }
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    if ((!user && !isEditing) || (isEditing && formData.password)) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    onSave(formData);
  };

  if (user && !isEditing) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">User Details</h2>
          <div className="flex gap-2">
            <button onMouseEnter={(e) => showIconTooltip && showIconTooltip('Close', e)} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"><XMarkIcon className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-5"><div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-500 mb-1">User ID</label><p className="text-gray-900 font-medium">{user.id}</p></div>
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label><p className="text-gray-900 font-medium">{user.name}</p></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-500 mb-1">Email</label><p className="text-gray-900">{user.email}</p></div>
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Phone</label><p className="text-gray-900">{user.phone}</p></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-500 mb-1">Role</label><p className="text-gray-900">{user.role}</p></div>
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Status</label><p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.status}</p></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-500 mb-1">District</label><p className="text-gray-900">{user.district || 'Amravati'}</p></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-sm font-medium text-gray-500 mb-1">Taluka</label><p className="text-gray-900">{user.taluka || '-'}</p></div>
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Village</label><p className="text-gray-900">{user.village || '-'}</p></div></div></div>
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Jurisdiction</label><p className="text-gray-900">{user.jurisdiction}</p></div>
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Joined Date</label><p className="text-gray-900">{user.joinDate}</p></div>
        </div>
        <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
          <button onMouseEnter={(e) => showIconTooltip && showIconTooltip('Edit User', e)} onClick={() => setIsEditing(true)} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg font-medium text-sm flex items-center justify-center gap-2">
            <PencilIcon className="h-4 w-4" /> Edit User
          </button>
          <button onMouseEnter={(e) => showIconTooltip && showIconTooltip('Close', e)} onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-sm">Close</button>
        </div></div>
      </motion.div>
    </motion.div>);
  }

  return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{user ? 'Edit User' : 'Add New User'}</h2>
        <button onMouseEnter={(e) => showIconTooltip && showIconTooltip('Close', e)} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"><XMarkIcon className="h-5 w-5" /></button>
      </div>
      <div className="p-5"><form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">User ID (Number) <span className="text-red-500">*</span></label>
          {/* <input type="number" required disabled={user} value={formData.userID} onChange={(e) => setFormData({...formData, userID: e.target.value})} */}

          <input 
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  required
  disabled={user}
  value={formData.userID}
  onChange={(e) => {
    const value = e.target.value;

    // only digits allow
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, userID: value });
    }
  }}
   className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-sm"
  placeholder="Enter user ID (digits only)"
/>
{errors.userID && <p className="mt-1 text-xs text-red-500">⚠️ {errors.userID}</p>}
</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Enter full name" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="example@email.com" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
          <input type="tel" required value={formData.phone} onChange={(e) => { const value = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({...formData, phone: value}); setErrors({...errors, phone: ''}); }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} placeholder="Enter 10-digit mobile number" />
          {errors.phone && <p className="mt-1 text-xs text-red-500">⚠️ {errors.phone}</p>}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
          <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select disabled={!user} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed">
            <option value="Active">Active</option><option value="Inactive">Inactive</option>
          </select></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
          <input type="text" required value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Enter district" /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-sm font-medium text-gray-700 mb-1">Taluka</label>
          <select value={formData.taluka} onChange={(e) => { setFormData({...formData, taluka: e.target.value, village: ''}); if(e.target.value) fetchVillages(e.target.value); }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Select Taluka</option>{talukas.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
          </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
          <select value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} disabled={!formData.taluka}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Select Village</option>{villages.map((v, idx) => <option key={idx} value={v}>{v}</option>)}
          </select></div></div>
        </div>
        {(!user || (user && isEditing)) && (<div><label className="block text-sm font-medium text-gray-700 mb-1">{user ? 'New Password (leave blank to keep current)' : 'Password'} <span className="text-red-500">*</span></label>
        <div className="relative"><input type={showPassword ? "text" : "password"} required={!user} value={formData.password}
          onChange={(e) => { setFormData({...formData, password: e.target.value}); setErrors({...errors, password: ''}); }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-10 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} placeholder="Enter password" />
          <button type="button" onMouseEnter={(e) => showIconTooltip && showIconTooltip(showPassword ? 'Hide Password' : 'Show Password', e)} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
          </button></div>
        {errors.password && <p className="mt-1 text-xs text-red-500">⚠️ {errors.password}</p>}
        <p className="text-xs text-gray-500 mt-1">Password must contain: 1 uppercase, 1 lowercase, 1 number, 1 special character (!@#$%^&*), min 8 characters</p></div>)}
        <div className="flex gap-3 pt-2">
          <button type="submit" onMouseEnter={(e) => showIconTooltip && showIconTooltip(user ? 'Update User' : 'Create User', e)} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg font-medium text-sm">{user ? 'Update User' : 'Create User'}</button>
          <button type="button" onMouseEnter={(e) => showIconTooltip && showIconTooltip('Cancel', e)} onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
        </div>
      </form></div>
    </motion.div>
  </motion.div>);
};

const ConfirmPopup = ({ message, onConfirm, onCancel }) => (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onCancel}>
  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
    className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
    <div className="p-5 text-center"><div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><XMarkIcon className="h-7 w-7 text-red-600" /></div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Close</h3><p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex gap-3"><button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-sm">No</button>
      <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">Yes, Close</button></div>
    </div>
  </motion.div>
</motion.div>);

export default UserManagementComponent;