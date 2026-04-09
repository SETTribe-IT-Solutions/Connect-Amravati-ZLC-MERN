import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  MegaphoneIcon, 
  MapPinIcon, 
  UserGroupIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { createAnnouncement } from '../../services/announcementService';

const AnnouncementForm = ({ onClose, onSuccess, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    isCircular: false,
    targetRole: '',
    targetTaluka: '',
    targetVillage: ''
  });

  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const roleLevels = {
    'COLLECTOR': 1,
    'ADDITIONAL_DEPUTY_COLLECTOR': 2,
    'SDO': 3,
    'TEHSILDAR': 4,
    'BDO': 5,
    'TALATHI': 6,
    'GRAMSEVAK': 7
  };

  const roleDisplayNames = {
    'COLLECTOR': 'Collector',
    'ADDITIONAL_DEPUTY_COLLECTOR': 'Additional Collector',
    'SDO': 'SDO',
    'TEHSILDAR': 'Tehsildar',
    'BDO': 'BDO',
    'TALATHI': 'Talathi',
    'GRAMSEVAK': 'Gram Sevak'
  };

  const currentUserLevel = roleLevels[currentUser?.role] || 99;

  // Filter roles that are lower level than current user
  const availableTargetRoles = Object.keys(roleLevels).filter(role => roleLevels[role] > currentUserLevel);

  useEffect(() => {
    // Fetch Talukas (Filtered by targetRole if selected)
    const url = formData.targetRole 
      ? `http://localhost:8080/api/talukas?role=${formData.targetRole}`
      : "http://localhost:8080/api/talukas";

    axios.get(url)
      .then(res => {
        const talukaNames = res.data.map(t => t.taluka);
        setTalukas(talukaNames);
      })
      .catch(err => console.error("Error fetching talukas:", err));
  }, [formData.targetRole]);

  useEffect(() => {
    if (!formData.targetTaluka) {
      setVillages([]);
      return;
    }
    // Fetch Villages for selected Taluka (Filtered by targetRole if selected)
    const url = formData.targetRole
      ? `http://localhost:8080/api/villages/${formData.targetTaluka}?role=${formData.targetRole}`
      : `http://localhost:8080/api/villages/${formData.targetTaluka}`;

    axios.get(url)
      .then(res => {
        const villageNames = res.data.map(v => v.village);
        setVillages(villageNames);
      })
      .catch(err => console.error("Error fetching villages:", err));
  }, [formData.targetTaluka, formData.targetRole]);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error('Invalid file format. Allowed: pdf, doc, docx, xls, xlsx, csv, txt, jpg, jpeg, png');
      // Reset the file input so the invalid file isn't kept
      e.target.value = null;
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      e.target.value = null;
      return;
    }
    
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        isCircular: formData.isCircular,
        targetRole: formData.targetRole || null,
        targetTaluka: formData.targetTaluka || null,
        targetVillage: formData.targetVillage || null,
        requesterId: currentUser?.userID
      };

      await createAnnouncement(payload, file);
      toast.success('Message sent successfully');
      onSuccess();
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast.error(error.response?.data || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MegaphoneIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Send Communications & Announcement</h2>
              <p className="text-blue-100 text-sm">Target by role and area</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject / Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                placeholder="Enter message title..."
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all resize-none"
                placeholder="Type your official communication here..."
              />
            </div>

            {/* Target Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <UserGroupIcon className="h-4 w-4 text-indigo-500" />
                  Target Role
                </label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    targetRole: e.target.value,
                    targetTaluka: '',
                    targetVillage: ''
                  })}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all appearance-none"
                >
                  <option value="">Broadcast to All Roles</option>
                  {availableTargetRoles.map(role => (
                    <option key={role} value={role}>{roleDisplayNames[role]}</option>
                  ))}
                </select>
              </div>

              {/* Taluka Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPinIcon className="h-4 w-4 text-indigo-500" />
                  Target Taluka (Area)
                </label>
                <select
                  value={formData.targetTaluka}
                  onChange={(e) => setFormData({ ...formData, targetTaluka: e.target.value, targetVillage: '' })}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all appearance-none"
                >
                  <option value="">All Talukas</option>
                  {talukas.map(taluka => (
                    <option key={taluka} value={taluka}>{taluka}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Village Selection (Conditional) */}
            {formData.targetTaluka && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPinIcon className="h-4 w-4 text-indigo-500" />
                  Target Specific Village
                </label>
                <select
                  value={formData.targetVillage}
                  onChange={(e) => setFormData({ ...formData, targetVillage: e.target.value })}
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all appearance-none"
                >
                  <option value="">All Villages in {formData.targetTaluka}</option>
                  {villages.map(village => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* File Attachment */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <PaperClipIcon className="h-4 w-4 text-indigo-500" />
                Attachment (Optional)
              </label>
              <div className="relative group">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label 
                  htmlFor="file-upload"
                  className={`w-full flex items-center justify-between px-5 py-3.5 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    file 
                      ? 'border-green-400 bg-green-50/50' 
                      : 'border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${file ? 'bg-green-100' : 'bg-white shadow-sm'}`}>
                      <PaperClipIcon className={`h-5 w-5 ${file ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${file ? 'text-green-700' : 'text-gray-700'}`}>
                        {file ? file.name : 'Select a file to attach'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, Images, or Documents (Max 10MB)'}
                      </p>
                    </div>
                  </div>
                  {file && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5" />
                  {formData.isCircular ? 'Publish Circular' : 'Send Message'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AnnouncementForm;
