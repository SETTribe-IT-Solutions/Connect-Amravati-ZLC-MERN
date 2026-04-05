import React, { useState, useEffect } from 'react';
import { getAllUsers, addUser, updateUser, deleteUser, toggleUserStatus } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  XMarkIcon,
  CheckBadgeIcon,
  TrophyIcon,
  FlagIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const UserManagementComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [showTooltip, setShowTooltip] = useState({ visible: false, message: '', x: 0, y: 0 });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  const showToast = (title, value) => {
    setToast({ title, value });
    setTimeout(() => setToast(null), 3000);
  };

  const showIconTooltip = (message, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowTooltip({
      visible: true,
      message: message,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setTimeout(() => setShowTooltip({ visible: false, message: '', x: 0, y: 0 }), 1500);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const savedId = localStorage.getItem('userID');
      const requesterId = (savedId && !isNaN(savedId)) ? Number(savedId) : null;
      const data = await getAllUsers(requesterId);
      
      const revRoleMap = {
        'COLLECTOR': 'Collector',
        'ADDITIONAL_DEPUTY_COLLECTOR': 'Additional Collector',
        'SDO': 'SDO',
        'TEHSILDAR': 'Tehsildar',
        'BDO': 'BDO',
        'TALATHI': 'Talathi',
        'GRAMSEVAK': 'Gram Sevak',
        'SYSTEM_ADMINISTRATOR': 'System Administrator'
      };

      const mapped = (data || []).map(u => ({
        id: u.userID,
        name: u.name || 'Unknown',
        role: (u.role && revRoleMap[u.role.toUpperCase()]) ? revRoleMap[u.role.toUpperCase()] : (u.role || 'User'),
        email: u.email || 'N/A',
        phone: u.phone || '+91 00000 00000',
        village: u.village || '',
        taluka: u.taluka || '',
        district: u.district || '',
        jurisdiction: u.village ? `${u.village}, ${u.taluka}` : (u.taluka || u.district || 'Amravati'),
        status: u.active ? 'Active' : 'Inactive',
        avatar: (u.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2),
        tasksCompleted: u.tasksCompleted || 0,
        rating: u.rating || 0,
        joinDate: u.createdAt ? u.createdAt.toString().split('T')[0] : 'N/A',
        achievements: u.achievements || 0,
        pendingTasks: u.pendingTasks || 0
      }));
      setUsers(mapped);
    } catch (error) {
       console.error("Fetch Users Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roles = [
    'Collector',
    'Additional Collector',
    'SDO',
    'Tehsildar',
    'BDO',
    'Talathi',
    'Gram Sevak',
    'System Administrator'
  ];

  // Stats without arrows and without Avg Rating
  const stats = [
    { label: 'Total Users', value: users.length, icon: UserCircleIcon, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Active Users', value: users.filter(u => u.status === 'Active').length, icon: ShieldCheckIcon, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'New This Month', value: users.filter(u => {
        const jDate = new Date(u.joinDate);
        const now = new Date();
        return jDate.getMonth() === now.getMonth() && jDate.getFullYear() === now.getFullYear();
      }).length, icon: TrophyIcon, bgColor: 'bg-purple-50', textColor: 'text-purple-600' }
  ];

  const getRoleColor = (role) => {
    const colors = {
      'Collector': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'Additional Collector': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      'SDO': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'Tehsildar': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      'BDO': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      'Talathi': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      'Gram Sevak': 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
      'System Administrator': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    };
    return colors[role] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (userId) => {
    try {
      const requesterId = localStorage.getItem('userID');
      await deleteUser(userId, requesterId);
      setUsers(users.filter(user => user.id !== userId));
      setShowDeletePopup(false);
      setUserToDelete(null);
      showToast('User Deleted', 'Successfully removed');
    } catch (error) {
      console.error("Delete user error:", error);
      showToast('Delete Failed', 'Unable to delete user');
    }
  };

  const handleStatClick = (stat) => {
    showToast(stat.label, stat.value);
  };

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

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip.visible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed z-50 bg-gray-900 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap pointer-events-none"
            style={{ left: showTooltip.x, top: showTooltip.y, transform: 'translateX(-50%)' }}
          >
            {showTooltip.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users, roles, and permissions across all departments</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedUser(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium"
            >
              <UserPlusIcon className="h-5 w-5" />
              Add User
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards - 3 cards only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => handleStatClick(stat)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* List View Only */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-gray-100">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-gray-500 font-medium">Loading user data...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircleIcon className="h-10 w-10 text-blue-300" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
           <p className="text-gray-500 max-w-sm mx-auto">No users match your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Jurisdiction</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Stats</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                        </div>
                      </div>
                     </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                     </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                     </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.jurisdiction}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{user.tasksCompleted} tasks</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{user.achievements} achv</span>
                      </div>
                     </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status}
                      </span>
                     </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { showIconTooltip('View Details', e); setSelectedUser(user); setIsModalOpen(true); }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => { showIconTooltip('Edit User', e); setSelectedUser(user); setIsModalOpen(true); }}
                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-500 hover:text-green-600" />
                        </button>
                        <button
                          onClick={(e) => { showIconTooltip('Delete User', e); setUserToDelete(user); setShowDeletePopup(true); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </button>
                      </div>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <UserModal 
            user={selectedUser} 
            roles={roles}
            talukas={talukas}
            villages={villages}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={async (userData) => {
              try {
                const roleMap = {
                  'Collector': 'COLLECTOR',
                  'Additional Collector': 'ADDITIONAL_DEPUTY_COLLECTOR',
                  'SDO': 'SDO',
                  'Tehsildar': 'TEHSILDAR',
                  'BDO': 'BDO',
                  'Talathi': 'TALATHI',
                  'Gram Sevak': 'GRAMSEVAK',
                  'System Administrator': 'SYSTEM_ADMINISTRATOR'
                };

                const payload = {
                  ...userData,
                  role: roleMap[userData.role] || userData.role,
                  requesterId: localStorage.getItem('userID'),
                  active: userData.status === 'Active'
                };
                delete payload.status;

                if (selectedUser && !payload.password) delete payload.password;
                
                if (selectedUser) await updateUser(selectedUser.id, payload);
                else await addUser(payload);
                
                fetchUsers();
                setIsModalOpen(false);
                setSelectedUser(null);
                showToast(selectedUser ? 'User Updated' : 'User Created', 'Successfully');
              } catch (error) {
                showToast('Operation Failed', 'Please try again');
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Popup */}
      <AnimatePresence>
        {showDeletePopup && userToDelete && (
          <DeletePopup 
            user={userToDelete}
            onConfirm={handleDelete}
            onCancel={() => {
              setShowDeletePopup(false);
              setUserToDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, roles, talukas, villages, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    userID: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: (user?.phone || '').replace(/\D/g, '').slice(0, 10),
    role: user?.role || roles[0],
    district: user?.district || 'Amravati',
    taluka: user?.taluka || '',
    village: user?.village || '',
    status: user?.status || 'Active',
    password: ''
  });

  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    setPhoneError('');
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID <span className="text-red-500">*</span></label>
                <input type="number" required disabled={user} value={formData.userID}
                  onChange={(e) => setFormData({...formData, userID: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({...formData, phone: value});
                    if (value.length === 10) setPhoneError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${phoneError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select required value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                  {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                  <option value="Active">Active</option><option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taluka</label>
                  <select value={formData.taluka}
                    onChange={(e) => setFormData({...formData, taluka: e.target.value, village: ''})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Select Taluka</option>
                    {talukas.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                  <select value={formData.village}
                    onChange={(e) => setFormData({...formData, village: e.target.value})}
                    disabled={!formData.taluka}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Select Village</option>
                    {villages.map((v, idx) => <option key={idx} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {user ? 'New Password (leave blank to keep current)' : 'Password'} <span className="text-red-500">*</span>
              </label>
              <input type="password" required={!user} value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg font-medium text-sm">
                {user ? 'Update User' : 'Create User'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Delete Popup Component
const DeletePopup = ({ user, onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <TrashIcon className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User</h3>
          <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete "{user?.name}"? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
            <button onClick={() => onConfirm(user.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">Delete</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserManagementComponent;