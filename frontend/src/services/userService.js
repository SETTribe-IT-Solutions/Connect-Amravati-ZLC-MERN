import axiosInstance from "../config/axiosConfig";

export const getAllUsers = async (requesterId) => {
  const response = await axiosInstance.get("/users/all", {
    params: { requesterId }
  });
  return response.data;
};

export const addUser = async (userData) => {
  const response = await axiosInstance.post("/users/add", userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`/users/update/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id, requesterId) => {
  const response = await axiosInstance.delete(`/users/delete/${id}`, {
    data: { requesterId }
  });
  return response.data;
};

export const toggleUserStatus = async (id, requesterId) => {
  const response = await axiosInstance.post(`/users/toggle-status/${id}`, {
    requesterId
  });
  return response.data;
};

export const getUserProfile = async (id, requesterId) => {
  const response = await axiosInstance.get(`/users/profile/${id}`, {
    params: { requesterId }
  });
  return response.data;
};

export const getUsersByRole = async (role, requesterId) => {
  const response = await axiosInstance.get(`/users/role/${role}`, {
    params: { requesterId }
  });
  return response.data;
};
