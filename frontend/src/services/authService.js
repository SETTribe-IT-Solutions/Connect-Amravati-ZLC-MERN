import axiosInstance from "../config/axiosConfig";

export const loginUser = async (userID, password) => {
  const response = await axiosInstance.post("/auth/login", {
    userID,
    password
  });

  return response.data; // Backend returns LoginResponse object
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("sessionToken");
};

export const changePassword = async (userID, currentPassword, newPassword) => {
  const response = await axiosInstance.post("/auth/change-password", {
    userID,
    currentPassword,
    newPassword
  });
  return response.data;
};