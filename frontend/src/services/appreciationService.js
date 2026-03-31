import axiosInstance from "../config/axiosConfig";

export const sendAppreciation = async (appreciationData) => {
  const response = await axiosInstance.post("/appreciations/send", appreciationData);
  return response.data;
};

export const getAllAppreciations = async () => {
  const response = await axiosInstance.get("/appreciations/all");
  return response.data;
};

export const getReceivedAppreciations = async (userId) => {
  const response = await axiosInstance.get(`/appreciations/received/${userId}`);
  return response.data;
};

export const getSentAppreciations = async (userId) => {
  const response = await axiosInstance.get(`/appreciations/sent/${userId}`);
  return response.data;
};
