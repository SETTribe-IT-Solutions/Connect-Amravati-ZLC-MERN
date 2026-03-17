import axiosInstance from "../config/axiosConfig";

export const loginUser = async (username, password) => {
  const response = await axiosInstance.post("/auth/login", {
    username,
    password
  });

  return response.data; 
};