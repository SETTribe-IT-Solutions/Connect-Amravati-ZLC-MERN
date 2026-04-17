import axiosInstance from "../../config/axiosConfig";

export const sendAppreciation = async (appreciationData) => {
  const response = await axiosInstance.post("/appreciations/send", appreciationData);
  return response.data;
};

export const getAllAppreciations = async (params) => {
  const response = await axiosInstance.get("/appreciation/all", { params });
  return response.data;
};

export const getReceivedAppreciations = async (userId, params) => {
  const response = await axiosInstance.get(`/appreciation/received/${userId}`, { params });
  return response.data;
};

export const getSentAppreciations = async (userId, params) => {
  const response = await axiosInstance.get(`/appreciation/sent/${userId}`, { params });
  return response.data;
};

export const getEligibleUsers = async () => {
  const response = await axiosInstance.get("/appreciations/eligible-users");
  return response.data;
};
