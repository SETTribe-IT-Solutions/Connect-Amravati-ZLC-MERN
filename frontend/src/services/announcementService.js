import axios from 'axios';

const API_URL = 'http://localhost:8080/api/announcements';

const getAuthHeader = () => {
  const token = localStorage.getItem('sessionToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createAnnouncement = async (announcementData, file) => {
  const formData = new FormData();
  formData.append('announcement', new Blob([JSON.stringify(announcementData)], {
    type: 'application/json'
  }));
  
  if (file) {
    formData.append('file', file);
  }

  const response = await axios.post(`${API_URL}/create`, formData, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnnouncements = async (userId) => {
  const response = await axios.get(`${API_URL}/list`, {
    params: { userId },
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getSentAnnouncements = async (userId) => {
  const response = await axios.get(`${API_URL}/sent`, {
    params: { userId },
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getAnnouncementAcknowledgments = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/acknowledgments`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const acknowledgeAnnouncement = async (id, userId) => {
  const response = await axios.post(`${API_URL}/${id}/acknowledge`, null, {
    params: { userId },
    headers: getAuthHeader(),
  });
  return response.data;
};
