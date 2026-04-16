import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllAppreciations, sendAppreciation, getEligibleUsers } from '../../../services/appreciation/appreciationService';
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
import Pagination from '../../common/Pagination';

const AppreciationComponent = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [formStates, setFormStates] = useState({}); // Tracking message/badge for each user

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const [appreciations, setAppreciations] = useState([]);
  const [staff, setStaff] = useState([]);

  // Use props user id if available
  const currentUserID = user?.userID;
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
        liked: false,
        toUserEverAppreciated: app.toUserEverAppreciated,
        fromRole: formatRole(app.fromRole),
        toRole: formatRole(app.toRole)
      }));
      setAppreciations(mapped);
    } catch (error) {
      console.error("Fetch Appreciations Error:", error);
      toast.error("Failed to load appreciations");
    } finally {
      // intentionally empty
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getEligibleUsers();
      // Filter out the current user
      const filteredData = (data || []).filter(u => u.userID.toString() !== currentUserID?.toString());
      setStaff(filteredData);
      // Initialize form states for new staff
      const initialStates = {};
      filteredData.forEach(u => {
        initialStates[u.userID] = {
          message: '',
          badge: 'Excellence Award',
          isSubmitting: false
        };
      });
      setFormStates(initialStates);
    } catch (error) {
      console.error("Fetch Eligible Users Error:", error);
      toast.error("Failed to load eligible users");
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

  const formatRole = (roleStr) => {
    if (!roleStr) return 'N/A';
    const roleMap = {
      'COLLECTOR': 'Collector',
      'ADDITIONAL_DEPUTY_COLLECTOR': 'Additional Collector',
      'SDO': 'SDO',
      'TEHSILDAR': 'Tehsildar',
      'BDO': 'BDO',
      'TALATHI': 'Talathi',
      'GRAMSEVAK': 'Gram Sevak',
      'SYSTEM_ADMINISTRATOR': 'System Administrator'
    };
    return roleMap[roleStr.toUpperCase()] || roleStr;
  };

  // Filter appreciations
  const filteredAppreciations = appreciations.filter(apt => {
    const matchesSearch = apt.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Improved "mine" filter logic to use actual logged-in user name
    const currentUserName = user?.name || '';
    
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

  const handleInlineSubmit = async (targetUser) => {
    const formData = formStates[targetUser.userID];
    if (!formData.message.trim()) {
      toast.error("Please add a message");
      return;
    }

    setFormStates(prev => ({
      ...prev,
      [targetUser.userID]: { ...formData, isSubmitting: true }
    }));

    try {
      const fromUserId = user?.userID;
      const payload = {
        fromUserId,
        toUserId: targetUser.userID,
        message: formData.message,
        badge: formData.badge
      };
      console.log("Sending appreciation payload:", payload);
      
      await sendAppreciation(payload);
      
      toast.success(`Appreciation sent to ${targetUser.name}!`);
      
      // Refresh both lists
      fetchAppreciations();
      fetchStaff();
    } catch (error) {
      console.error("Send Appreciation Full Error:", error);
      console.error("Response Data:", error.response?.data);
      console.error("Response Status:", error.response?.status);
      toast.error(
        typeof error.response?.data === 'object' 
          ? JSON.stringify(error.response.data) 
          : (error.response?.data?.message || "Failed to send appreciation")
      );
      setFormStates(prev => ({
        ...prev,
        [targetUser.userID]: { ...formData, isSubmitting: false }
      }));
    }
  };

  const badges = [
    'Excellence Award',
    'Community Service',
    'Quick Resolution',
    'Innovation Award',
    'Team Excellence'
  ];

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Amravati Connect
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 flex items-center gap-2">
              <span className="hidden sm:block w-1 h-1 bg-blue-600 rounded-full"></span>
              Celebrate team achievements and foster a culture of appreciation
            </p>
          </div>
        </div>
      </motion.div>

      {/* Users Awaiting Appreciation Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Users Awaiting Appreciation</h2>
            <p className="text-sm text-gray-500">Give a quick shout-out to those who haven't received one yet</p>
          </div>
        </div>

        {staff.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode='popLayout'>
              {staff.map((member) => (
                <motion.div
                  key={member.userID}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-100">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{member.name}</h3>
                      <p className="text-xs text-gray-500 font-medium bg-gray-100 w-fit px-2 py-0.5 rounded uppercase tracking-wider">
                        {formatRole(member.role)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <select
                      value={formStates[member.userID]?.badge || 'Excellence Award'}
                      onChange={(e) => setFormStates(prev => ({
                        ...prev,
                        [member.userID]: { ...prev[member.userID], badge: e.target.value }
                      }))}
                      className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
                    >
                      {badges.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>

                    <textarea
                      placeholder={`What did ${member.name.split(' ')[0]} do well?`}
                      rows="2"
                      value={formStates[member.userID]?.message || ''}
                      onChange={(e) => setFormStates(prev => ({
                        ...prev,
                        [member.userID]: { ...prev[member.userID], message: e.target.value }
                      }))}
                      className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 resize-none"
                    />

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInlineSubmit(member)}
                      disabled={formStates[member.userID]?.isSubmitting}
                      className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
                        formStates[member.userID]?.isSubmitting 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      }`}
                    >
                      {formStates[member.userID]?.isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <PaperAirplaneIcon className="h-4 w-4" />
                          Celebrate
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">All Caught Up!</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Everyone has been recognized for now. Check back later!</p>
          </div>
        )}
      </motion.div>

      {/* Appreciation Wall Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <TrophyIcon className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Appreciation Wall</h2>
          <p className="text-sm text-gray-500">A timeline of excellence and teamwork</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-medium text-gray-500 truncate">{stat.label}</p>
                <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-2 truncate">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-2 sm:p-4 rounded-lg sm:rounded-2xl shrink-0`}>
                <stat.icon className={`h-5 w-5 sm:h-8 sm:w-8 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 mb-6 border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appreciations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">All</option>
              <option value="liked">Liked</option>
              <option value="mine">My Posts</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {filteredAppreciations
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((apt, index) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs">
                      {apt.fromAvatar}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">From</p>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">{apt.from}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{apt.fromRole}</p>
                    </div>
                  </div>
                  
                  {/* Arrow element - hidden/responsive */}
                  <div className="flex items-center justify-center sm:block">
                    <span className="hidden sm:inline text-gray-300 text-lg">→</span>
                    <span className="inline sm:hidden text-gray-300 text-sm">↓</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs">
                      {apt.toAvatar}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">To</p>
                      <p className="font-bold text-emerald-700 text-xs sm:text-sm">{apt.to}</p>
                      <p className="text-[10px] text-emerald-600/70 font-medium uppercase tracking-wider">{apt.toRole}</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(apt.id)}
                  className="p-2 sm:p-2.5 bg-gray-50 hover:bg-red-50 rounded-full transition-colors self-end sm:self-auto"
                >
                  {apt.liked ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-400" />
                  )}
                </motion.button>
              </div>

              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(apt.badge)}`}>
                  {apt.badge}
                </span>
              </div>

              <div className="mb-4 bg-gray-50 rounded-xl p-4 italic text-gray-700">
                "{apt.message}"
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{apt.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartIcon className="h-4 w-4" />
                  <span>{apt.likes} Likes</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <Pagination 
        totalItems={filteredAppreciations.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AppreciationComponent;