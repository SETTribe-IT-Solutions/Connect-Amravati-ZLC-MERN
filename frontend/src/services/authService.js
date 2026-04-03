import axiosInstance from "../config/axiosConfig";

export const loginUser = async (userID, password) => {
  const response = await axiosInstance.post("/auth/login", {
    userID,
    password
  });

  console.log("Login Response Data:", response.data);

  const token = response.data?.accessToken || response.data?.token;

  if (token) {
    localStorage.setItem("sessionToken", token);
    localStorage.setItem("user", JSON.stringify(response.data));
    localStorage.setItem("role", response.data.role);
    localStorage.setItem("isAuthenticated", "true");
  } else {
    console.error("No token found in login response!");
  }

  return response.data; // Backend returns JwtResponse object
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