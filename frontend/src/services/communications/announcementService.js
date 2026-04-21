import axiosInstance from "../../config/axiosConfig";

const API_URL = '/announcements';

export const createAnnouncement = async (announcementData, file) => {
  const formData = new FormData();
  formData.append('announcement', new Blob([JSON.stringify(announcementData)], {
    type: 'application/json'
  }));
  
  if (file) {
    formData.append('file', file);
  }

  const response = await axiosInstance.post(`${API_URL}/create`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnnouncements = async (params) => {
  const response = await axiosInstance.get("/announcements/list", { params });
  return response.data;
};

export const getSentAnnouncements = async (params) => {
  const response = await axiosInstance.get("/announcements/sent", { params });
  return response.data;
};

export const getAnnouncementAcknowledgments = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}/acknowledgments`);
  return response.data;
};

export const acknowledgeAnnouncement = async (id, userId) => {
  const response = await axiosInstance.post(`${API_URL}/${id}/acknowledge`, null, {
    params: { userId }
  });
  return response.data;
};

export const updateAnnouncement = async (id, userId, data, file) => {
  const formData = new FormData();
  formData.append('announcement', new Blob([JSON.stringify(data)], {
    type: 'application/json'
  }));
  
  if (file) {
    formData.append('file', file);
  }

  const response = await axiosInstance.put(`${API_URL}/${id}`, formData, {
    params: { userId },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAnnouncement = async (id, userId) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`, {
    params: { userId }
  });
  return response.data;
};
