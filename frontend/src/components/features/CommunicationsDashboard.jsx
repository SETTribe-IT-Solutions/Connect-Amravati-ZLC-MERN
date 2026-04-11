import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MegaphoneIcon, 
  EnvelopeIcon, 
  CheckBadgeIcon, 
  PlusIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon,
  InboxIcon,
  PaperAirplaneIcon,
  MapPinIcon,
  ChevronRightIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  getAnnouncements, 
  getSentAnnouncements, 
  acknowledgeAnnouncement,
  getAnnouncementAcknowledgments,
  updateAnnouncement,
  deleteAnnouncement
} from '../../services/announcementService';
import AnnouncementForm from './AnnouncementForm';
import { toast } from 'react-hot-toast';

const CommunicationsDashboard = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [sentAnnouncements, setSentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox'); // inbox, sent
  const [filters, setFilters] = useState({
    date: '',
    month: '',
    year: ''
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [loadingAcks, setLoadingAcks] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', message: '' });
  const [updating, setUpdating] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const roleLevels = {
    'COLLECTOR': 1,
    'ADDITIONAL_DEPUTY_COLLECTOR': 2,
    'SDO': 3,
    'TEHSILDAR': 4
  };

  const isSeniorOfficial = user?.role && roleLevels[user.role] <= 4;

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const promises = [getAnnouncements(user?.userID)];
      
      if (isSeniorOfficial) {
        promises.push(getSentAnnouncements(user?.userID));
      }
      
      const results = await Promise.all(promises);
      setAnnouncements(results[0]);
      
      if (isSeniorOfficial && results[1]) {
        setSentAnnouncements(results[1]);
      }
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userID) {
      fetchAnnouncements();
    }
  }, [user?.userID, isSeniorOfficial]);

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAnnouncement(id, user?.userID);
      toast.success("Message acknowledged");
      fetchAnnouncements(); // Refresh list
    } catch (error) {
      toast.error("Failed to acknowledge");
    }
  };

  const fetchAcknowledgments = async (announcement) => {
    if (!announcement?.id) return;
    try {
      setSelectedAnnouncement(announcement);
      setLoadingAcks(true);
      const data = await getAnnouncementAcknowledgments(announcement.id);
      setAcknowledgments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching acknowledgments:", error);
      toast.error("Failed to load acknowledgments");
      setAcknowledgments([]);
    } finally {
      setLoadingAcks(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingAnnouncementId(id);
  };

  const executeDelete = async () => {
    if (!deletingAnnouncementId) return;
    setIsDeleting(true);
    try {
      await deleteAnnouncement(deletingAnnouncementId, user?.userID);
      toast.success("Message deleted successfully");
      fetchAnnouncements();
      setDeletingAnnouncementId(null);
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingAnnouncement(item);
    setEditForm({ title: item.title, message: item.message });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateAnnouncement(editingAnnouncement.id, user?.userID, editForm);
      toast.success('Message updated successfully');
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to update message");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ date: '', month: '', year: '' });
  };

  const applyFilters = (list) => {
    return list.filter(item => {
      const date = new Date(item.createdAt);
      const itemYear = date.getFullYear().toString();
      const itemMonth = (date.getMonth() + 1).toString();
      const itemDate = date.toISOString().split('T')[0];

      if (filters.date && itemDate !== filters.date) return false;
      if (filters.month && itemMonth !== filters.month) return false;
      if (filters.year && itemYear !== filters.year) return false;

      return true;
    });
  };

  const currentDisplayList = applyFilters(activeTab === 'inbox' ? announcements : sentAnnouncements);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = ['2024', '2025', '2026'];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Communications and announcements
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            Manage internal communications, messages, and alerts
          </p>
        </div>

        {isSeniorOfficial && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold"
          >
            <PlusIcon className="h-5 w-5" />
            New Communication
          </motion.button>
        )}
      </div>

      {/* Tabs and Filters */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Tabs */}
        <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200 w-fit self-start">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${
              activeTab === 'inbox' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-500 hover:text-blue-600 hover:bg-white'
            }`}
          >
            <InboxIcon className="h-5 w-5" />
            Inbox
            {announcements.length > 0 && (
              <span className={`text-[10px] px-1.5 rounded-md ${activeTab === 'inbox' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {announcements.length}
              </span>
            )}
          </button>
            {isSeniorOfficial && (
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'sent' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-white'
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Sent Messages
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl md:rounded-3xl border border-blue-100 shadow-sm transition-all hover:shadow-md w-full lg:w-auto">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm px-2">
            <FunnelIcon className="h-5 w-5" />
            Filter By:
          </div>
          
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />

          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
          >
            <option value="">All Months</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="flex-1 md:flex-initial px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[120px]"
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {(filters.date || filters.month || filters.year) && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={clearFilters}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Clear Filters"
            >
              <XMarkIcon className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm p-20 border border-gray-100 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium font-outfit">Fetching communications...</p>
        </div>
      ) : currentDisplayList.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-20 border border-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MegaphoneIcon className="w-12 h-12 text-blue-200" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No communications found</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Check your filters or try switching between Inbox and Sent messages.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {currentDisplayList.map((item, index) => (
            <motion.div
              key={`${activeTab}-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col md:flex-row">
                <div className={`w-full md:w-2 border-r ${activeTab === 'inbox' ? 'bg-indigo-600' : 'bg-blue-600'}`} />
                
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        activeTab === 'inbox' 
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {activeTab === 'inbox' ? 'Received' : 'Sent'}
                      </span>
                      {activeTab === 'inbox' && item.acknowledged && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                          <CheckBadgeIcon className="h-4 w-4" />
                          Acknowledged
                        </span>
                      )}
                      {activeTab === 'sent' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fetchAcknowledgments(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm"
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                          {item.acknowledgmentCount} Acknowledgments
                          <ChevronRightIcon className="h-3 w-3 ml-0.5" />
                        </motion.button>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        {formatTime(item.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DocumentTextIcon className="h-4 w-4" />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="prose prose-blue max-w-none mb-8 text-gray-600 leading-relaxed font-roboto">
                    {item.message}
                  </div>

                  {activeTab === 'sent' && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <MapPinIcon className="h-4 w-4" />
                        Target Audience:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600">
                          {item.targetRole}
                        </span>
                        {(item.targetTaluka !== 'ALL TALUKAS' || item.targetVillage !== 'ALL VILLAGES') && (
                           <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600">
                             {item.targetTaluka}{item.targetVillage !== 'ALL VILLAGES' ? ` > ${item.targetVillage}` : ''}
                           </span>
                        )}
                      </div>
                    </div>
                  )}

                  {item.attachment && (
                    <div className="mb-6 flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 group/attach hover:bg-indigo-50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-indigo-600 rounded-xl shadow-sm group-hover/attach:scale-110 transition-transform">
                          <PaperClipIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[150px] md:max-w-xs">
                            {item.attachment.split('-').slice(1).join('-') || 'Attachment'}
                          </p>
                          <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">
                            Official Document / Image
                          </p>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:8080/uploads/${item.attachment}`}
                        download={item.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all shadow-sm"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner bg-gray-50 border border-gray-100">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {activeTab === 'inbox' ? 'Sent By' : 'Author'}
                        </p>
                        <p className="font-bold text-gray-900">{item.creatorName}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.creatorRole}</p>
                      </div>
                    </div>

                    {activeTab === 'inbox' && (
                      !item.acknowledged ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcknowledge(item.id)}
                          className="px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                          <ShieldCheckIcon className="h-5 w-5" />
                          Acknowledge Receipt
                        </motion.button>
                      ) : (
                        <div className="text-green-600 font-bold flex items-center gap-2 px-6 py-3 bg-green-50 rounded-2xl border border-green-100">
                          <CheckBadgeIcon className="h-6 w-6" />
                          Acknowledged
                        </div>
                      )
                    )}

                    {activeTab === 'sent' && (
                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEditModal(item)}
                          className="px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => confirmDelete(item.id)}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <AnnouncementForm 
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => {
              setIsFormOpen(false);
              fetchAnnouncements();
            }}
            currentUser={user}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {editingAnnouncement && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAnnouncement(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100"
            >
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-outfit flex items-center gap-2">
                    <PencilSquareIcon className="h-6 w-6" />
                    Edit Communication
                  </h2>
                </div>
                <button
                  onClick={() => setEditingAnnouncement(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject / Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                  <textarea
                    required
                    rows={5}
                    value={editForm.message}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Acknowledgments Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-outfit">Acknowledgment List</h2>
                  <p className="text-blue-100 text-sm mt-1 truncate max-w-md opacity-80">
                    "{selectedAnnouncement.title}"
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50/50">
                {loadingAcks ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 mt-4 font-medium">Loading acknowledgments...</p>
                  </div>
                ) : (acknowledgments || []).length === 0 ? (
                  <div className="py-20 text-center">
                    <ShieldCheckIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No one has acknowledged this message yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acknowledgments.map((ack, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shadow-inner">
                            {ack.userName ? ack.userName.charAt(0) : '?'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-sm">
                              {ack.userName || 'Unknown User'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                {ack.userRole || 'N/A'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" />
                                {ack.taluka || 'N/A'} | {ack.village || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900">{ack.acknowledgedAt ? formatDate(ack.acknowledgedAt) : 'N/A'}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{ack.acknowledgedAt ? formatTime(ack.acknowledgedAt) : 'N/A'}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingAnnouncementId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeletingAnnouncementId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100"
            >
              <div className="p-8 pb-6 flex flex-col items-center text-center">
                 <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                    <TrashIcon className="h-10 w-10" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-3 font-outfit">Delete Communication</h2>
                 <p className="text-gray-500 font-medium">
                   Are you sure you want to delete this communication? This will also remove it from recipients' inboxes. 
                   <span className="block mt-2 text-red-500 font-bold">This action cannot be undone.</span>
                 </p>
              </div>
              <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setDeletingAnnouncementId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0 hover:-translate-y-0.5"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <TrashIcon className="h-5 w-5" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunicationsDashboard;
