import axiosInstance from "../../config/axiosConfig";

export const getPerformanceReport = async (requesterId) => {
  const response = await axiosInstance.get("/reports/performance", {
    params: { requesterId }
  });
  return response.data;
};

export const getGlobalStats = async (requesterId) => {
  const response = await axiosInstance.get("/reports/global-stats", {
    params: { requesterId }
  });
  return response.data;
};
