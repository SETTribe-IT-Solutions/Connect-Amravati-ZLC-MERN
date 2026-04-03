import axiosInstance from "../config/axiosConfig";

export const getDashboardStats = async (requesterId) => {
  const response = await axiosInstance.get("/tasks/dashboard", {
    params: { requesterId }
  });
  return response.data; // { total, pending, inProgress, completed, overdue }
};

export const getTasks = async (requesterId) => {
  const response = await axiosInstance.get("/tasks", {
    params: { requesterId }
  });
  return response.data; // List<TaskResponse>
};

export const createTask = async (formData) => {
  const response = await axiosInstance.post("/tasks", formData, {
    headers: {
      // Removing 'Content-Type': 'multipart/form-data' so the browser automatically appends the correct boundary!
      'Content-Type': undefined
    }
  });
  return response.data;
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

export const forwardTask = async (taskId, forwardToId, requesterId) => {
  const response = await axiosInstance.put(`/tasks/${taskId}/forward`, {
    forwardToId,
    requesterId
  });
  return response.data;
};

export const updateTaskProgress = async (taskId, achieved, requesterId) => {
  const response = await axiosInstance.put(`/tasks/${taskId}/progress`, {
    achieved,
    requesterId
  });
  return response.data;
};
