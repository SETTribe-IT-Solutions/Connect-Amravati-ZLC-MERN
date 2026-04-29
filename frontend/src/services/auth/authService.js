import axiosInstance from "../../config/axiosConfig";

export const loginUser = async (phone, password) => {
  const response = await axiosInstance.post("/auth/login", {
    phone,
    password
  });

  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }

  return response.data; // Backend returns LoginResponse object
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

export const logoutUser = async () => {
  localStorage.removeItem('accessToken');
  return await axiosInstance.post("/auth/logout");
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const changePassword = async (userID, currentPassword, newPassword) => {
  const response = await axiosInstance.post("/auth/change-password", {
    userID,
    currentPassword,
    newPassword
  });
  return response.data;
};

export const refreshSession = async () => {
  const response = await axiosInstance.post("/auth/refresh-token");
  return response.data;
};

export const verifyEmail = async (email) => {
  const response = await axiosInstance.post("/auth/verify-email", { email });
  return response.data;
};

export const resetPasswordByEmail = async (email, newPassword) => {
  const response = await axiosInstance.post("/auth/reset-password-email", { email, newPassword });
  return response.data;
};
