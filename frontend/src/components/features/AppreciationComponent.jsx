import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllAppreciations, sendAppreciation } from '../../services/appreciationService';
import { getAllUsers } from '../../services/userService';
import { toast } from 'react-hot-toast';
import {
  HeartIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const AppreciationComponent = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const [appreciations, setAppreciations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);

  // Use props user id if available, fallback to localStorage
  const currentUserID = user?.userID || localStorage.getItem('userID');
  const currentUserRole = user?.role || localStorage.getItem('role');

  const fetchAppreciations = async () => {
    try {
      const data = await getAllAppreciations();
      // Map backend AppreciationResponse to frontend expected format
      const mapped = data.map(app => ({
        id: app.id,
        from: app.fromUserName,
        fromAvatar: app.fromUserName.substring(0, 2).toUpperCase(),
        to: app.toUserName,
        toAvatar: app.toUserName.substring(0, 2).toUpperCase(),
        message: app.message,
        date: app.createdAt.split('T')[0],
        likes: 0,
        comments: 0,
        badge: app.badge || 'Excellence Award',
        liked: false
      }));
      setAppreciations(mapped);
    } catch (error) {
      console.error("Fetch Appreciations Error:", error);
      toast.error("Failed to load appreciations");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const uID = user?.userID || localStorage.getItem('userID');
      if (uID) {
        const data = await getAllUsers(uID);
        setStaff(data || []);
      }
    } catch (error) {
      console.error("Fetch Staff Error:", error);
      toast.error("Failed to load staff members");
    }
  };

  useEffect(() => {
    fetchAppreciations();
    fetchStaff();
  }, []);

  // Updated Statistics with Dashboard-like styling
  const stats = [
    { 
      label: 'Total Appreciations', 
      value: appreciations.length, 
      icon: HeartIcon, 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: ''
    },
    { 
      label: 'This Month', 
      value: appreciations.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length, 
      icon: StarIcon, 
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: ''
    },
    { 
      label: 'Unique Recipients', 
      value: new Set(appreciations.map(a => a.to)).size, 
      icon: UserGroupIcon, 
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: ''
    },
    { 
      label: 'Latest Badge', 
      value: appreciations.length > 0 ? appreciations[0].badge.split(' ')[0] : 'None', 
      icon: TrophyIcon, 
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: ''
    },
  ];

  // Badge colors - Updated to match theme
  const getBadgeColor = (badge) => {
    const colors = {
      'Excellence Award': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
      'Community Service': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      'Quick Resolution': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      'Innovation Award': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'Team Excellence': 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white'
    };
    return colors[badge] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  // Filter appreciations
  const filteredAppreciations = appreciations.filter(apt => {
    const matchesSearch = apt.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Improved "mine" filter logic to use actual logged-in user name
    const currentUserName = user?.name || JSON.parse(localStorage.getItem('user') || '{}').name || '';
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'liked' && apt.liked) ||
                         (filter === 'mine' && apt.from === currentUserName);
    return matchesSearch && matchesFilter;
  });

  // Handle like
  const handleLike = (id) => {
    setAppreciations(appreciations.map(apt => 
      apt.id === id 
        ? { ...apt, liked: !apt.liked, likes: apt.liked ? apt.likes - 1 : apt.likes + 1 }
        : apt
    ));
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
              Appreciation Wall
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
              Celebrate and recognize outstanding contributions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium"
          >
            <SparklesIcon className="h-5 w-5" />
            Send Appreciation
          </motion.button>
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
                <p className={`text-xs mt-2 flex items-center gap-1 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 
                  stat.change.startsWith('★') ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  <span>{stat.change.startsWith('+') ? '↑' : stat.change.startsWith('★') ? '★' : '→'}</span>
                  {stat.change}
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
              placeholder="Search appreciations by message or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Appreciations</option>
              <option value="liked">Most Liked</option>
              <option value="mine">From Me</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Appreciations Grid - Updated to match Task Management card style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAppreciations.map((apt, index) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
          >
            <div className="p-6">
              {/* Header with From/To section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {apt.fromAvatar}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="font-semibold text-gray-900">{apt.from}</p>
                    </div>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                      {apt.toAvatar}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="font-semibold text-gray-900">{apt.to}</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(apt.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {apt.liked ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
                  )}
                </motion.button>
              </div>

              {/* Badge */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(apt.badge)}`}>
                  {apt.badge}
                </span>
              </div>

              {/* Message */}
              <div className="mb-4 bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">"{apt.message}"</p>
              </div>

              {/* Footer with Date and Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <HeartIcon className="h-4 w-4 text-gray-400" />
                    <span>{apt.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400" />
                    <span>{apt.comments}</span>
                  </div>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Details
                  <span>→</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Send Appreciation Modal - Updated with blue theme */}
      <AnimatePresence>
        {isModalOpen && (
          <AppreciationModal 
            onClose={() => setIsModalOpen(false)} 
            staff={staff} 
            onSuccess={fetchAppreciations} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Appreciation Modal Component - Updated with blue theme
const AppreciationModal = ({ onClose, staff, onSuccess }) => {
  const [formData, setFormData] = useState({
    to: '',
    message: '',
    badge: 'Excellence Award'
  });

  const users = staff || [];

  const badges = [
    'Excellence Award',
    'Community Service',
    'Quick Resolution',
    'Innovation Award',
    'Team Excellence'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fromUserId = localStorage.getItem('userID');
      await sendAppreciation({
        fromUserId,
        toUserId: formData.to,
        message: formData.message,
        badge: formData.badge
      });
      onSuccess();
      onClose();
      toast.success("Appreciation sent successfully!");
    } catch (error) {
      console.error("Send Appreciation Error:", error);
      toast.error(error.response?.data?.message || "Failed to send appreciation");
    }
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with blue gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Send Appreciation</h2>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appreciate <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.to}
                onChange={(e) => setFormData({...formData, to: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select recipient...</option>
                {users.map(user => (
                  <option key={user.userID} value={user.userID}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appreciation Badge
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({...formData, badge: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {badges.map(badge => (
                  <option key={badge} value={badge}>{badge}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appreciation Message <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows="5"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Write your appreciation message..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                Send Appreciation
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

export default AppreciationComponent;