import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const UserManagementComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Sample users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Collector',
      email: 'rajesh.kumar@amravati.gov.in',
      phone: '+91 98765 43210',
      jurisdiction: 'Amravati District',
      status: 'Active',
      avatar: 'RK',
      tasksCompleted: 145,
      rating: 4.8,
      joinDate: '2020-01-15',
      achievements: 12,
      pendingTasks: 3
    },
    {
      id: 2,
      name: 'Priya Patil',
      role: 'Additional Collector',
      email: 'priya.patil@amravati.gov.in',
      phone: '+91 98765 43211',
      jurisdiction: 'Amravati District',
      status: 'Active',
      avatar: 'PP',
      tasksCompleted: 132,
      rating: 4.9,
      joinDate: '2021-03-20',
      achievements: 15,
      pendingTasks: 2
    },
    {
      id: 3,
      name: 'Suresh Deshmukh',
      role: 'Tehsildar',
      email: 'suresh.d@amravati.gov.in',
      phone: '+91 98765 43212',
      jurisdiction: 'Amravati Taluka',
      status: 'Active',
      avatar: 'SD',
      tasksCompleted: 98,
      rating: 4.6,
      joinDate: '2019-11-10',
      achievements: 8,
      pendingTasks: 5
    },
    {
      id: 4,
      name: 'Anita Sharma',
      role: 'BDO',
      email: 'anita.sharma@amravati.gov.in',
      phone: '+91 98765 43213',
      jurisdiction: 'Block Development Office',
      status: 'Active',
      avatar: 'AS',
      tasksCompleted: 87,
      rating: 4.7,
      joinDate: '2022-02-05',
      achievements: 7,
      pendingTasks: 4
    },
    {
      id: 5,
      name: 'Vikas Pawar',
      role: 'Talathi',
      email: 'vikas.p@amravati.gov.in',
      phone: '+91 98765 43214',
      jurisdiction: 'Circle 1 - Amravati',
      status: 'Inactive',
      avatar: 'VP',
      tasksCompleted: 56,
      rating: 4.2,
      joinDate: '2023-06-12',
      achievements: 4,
      pendingTasks: 2
    },
    {
      id: 6,
      name: 'Sunita Gaikwad',
      role: 'Gram Sevak',
      email: 'sunita.g@amravati.gov.in',
      phone: '+91 98765 43215',
      jurisdiction: 'Village A, B, C',
      status: 'Active',
      avatar: 'SG',
      tasksCompleted: 112,
      rating: 4.9,
      joinDate: '2021-08-30',
      achievements: 10,
      pendingTasks: 3
    },
  ]);

  // Role options
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

  // Updated Statistics with Dashboard-like styling
  const stats = [
    { 
      label: 'Total Users', 
      value: users.length, 
      icon: UserCircleIcon, 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%'
    },
    { 
      label: 'Active Users', 
      value: users.filter(u => u.status === 'Active').length, 
      icon: ShieldCheckIcon, 
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%'
    },
    { 
      label: 'New This Month', 
      value: '5', 
      icon: TrophyIcon, 
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+15%'
    },
    { 
      label: 'Avg. Rating', 
      value: '4.7', 
      icon: StarIcon, 
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '+0.3'
    },
  ];

  // Helper functions
  const getRoleColor = (role) => {
    const colors = {
      'Collector': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-200',
      'Additional Collector': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-200',
      'SDO': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-200',
      'Tehsildar': 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-200',
      'BDO': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-200',
      'Talathi': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-200',
      'Gram Sevak': 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-200',
      'System Administrator': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-200'
    };
    return colors[role] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-200';
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle delete
  const handleDelete = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setShowDeletePopup(false);
    setUserToDelete(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header with Dashboard-like styling */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
              Manage users, roles, and permissions across all departments
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
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
      </motion.div>

      {/* Stats Cards - Updated to match Dashboard style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-xs mt-2 flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{stat.change.startsWith('+') ? '↑' : '↓'}</span> {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-2xl`}>
                <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter - Updated to match Task Management style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
      </motion.div>

      {/* Users Grid View - Updated to match Task Management card style */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              {/* Header with gradient - Updated to blue/indigo theme */}
              <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {user.avatar}
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-12 p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-600">{user.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Row - Similar to Task Management */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-600">Tasks</p>
                    <p className="text-sm font-semibold text-blue-700">{user.tasksCompleted}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-600">Achievements</p>
                    <p className="text-sm font-semibold text-green-700">{user.achievements}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-yellow-600">Pending</p>
                    <p className="text-sm font-semibold text-yellow-700">{user.pendingTasks}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span>{user.jurisdiction}</span>
                  </div>
                </div>

                {/* Join Date */}
                <div className="mb-4 text-xs text-gray-500">
                  Joined: {user.joinDate}
                </div>

                {/* Actions - Updated to match Task Management */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedUser(user);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeletePopup(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // List View - Updated to match Task Management list style
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Jurisdiction</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stats</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-gray-500">{user.rating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.jurisdiction}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {user.tasksCompleted} tasks
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {user.achievements} achv
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeletePopup(true);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <UserModal 
            user={selectedUser} 
            roles={roles}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={(userData) => {
              if (selectedUser) {
                // Update existing user
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userData } : u));
              } else {
                // Create new user
                const newUser = {
                  ...userData,
                  id: users.length + 1,
                  avatar: userData.name.split(' ').map(n => n[0]).join('').substring(0, 2),
                  tasksCompleted: 0,
                  achievements: 0,
                  pendingTasks: 0,
                  rating: 0,
                  joinDate: new Date().toISOString().split('T')[0]
                };
                setUsers([...users, newUser]);
              }
              setIsModalOpen(false);
              setSelectedUser(null);
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

// User Modal Component (Updated with better styling)
const UserModal = ({ user, roles, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || roles[0],
    jurisdiction: user?.jurisdiction || '',
    status: user?.status || 'Active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter full name"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@amravati.gov.in"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Jurisdiction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.jurisdiction}
                onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Amravati District, Taluka Office, etc."
              />
            </div>

            {/* Password for new user */}
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter temporary password"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              >
                {user ? 'Update User' : 'Create User'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </motion.button>
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete User</h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete "{user?.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(user.id)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserManagementComponent;