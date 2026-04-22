import axiosInstance from "../../config/axiosConfig";

export const getDashboardStats = async (requesterId) => {
  const queryParam = requesterId ? `?requesterId=${requesterId}` : '';
  const response = await axiosInstance.get(`/tasks/dashboard${queryParam}`);
  return response.data; // { total, pending, inProgress, completed, overdue }
};

export const getTasks = async (requesterId) => {
  const queryParam = requesterId ? `?requesterId=${requesterId}` : '';
  const response = await axiosInstance.get(`/tasks${queryParam}`);
  
  // Handle Paginated Response (extract .content) or direct array
  if (response.data && response.data.content) {
    return response.data.content;
  }
  return response.data; // List<TaskResponse>
};

export const createTask = async (formData) => {
  console.log("Sending Task Data (FormData):", Object.fromEntries(formData.entries()));
  try {
    const response = await axiosInstance.post("/tasks", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("API Error in createTask:", error.response?.data || error.message);
    throw error; // Rethrow to be caught by the component
  }
};

export const updateTaskStatus = async (taskId, status, requesterId) => {
  const response = await axiosInstance.put(`/tasks/${taskId}/status`, {
    status,
    requesterId
  });
  return response.data;
};

export const addTaskRemark = async (taskId, remark, requesterId) => {
  const response = await axiosInstance.post(`/tasks/${taskId}/remark`, {
    remark,
    requesterId
  });
  return response.data;
};

export const updateTaskProgressAPI = async (taskId, achieved, requesterId) => {
  const response = await axiosInstance.put(`/tasks/${taskId}/progress`, {
    achieved,
    requesterId
  });
  return response.data;
};

export const forwardTaskAPI = async (taskId, forwardToId, requesterId) => {
  const response = await axiosInstance.put(`/tasks/${taskId}/forward`, {
    forwardToId,
    requesterId
  });
  return response.data;
};
