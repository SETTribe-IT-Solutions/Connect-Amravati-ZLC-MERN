import axiosInstance from "../../config/axiosConfig";

/**
 * Fetch unread notifications for the logged-in user.
 */
export const fetchNotifications = async (userId) => {
  if (!userId) return [];
  const response = await axiosInstance.get(`/notifications?userId=${userId}`);
  return response.data;
};

/**
 * Mark a specific notification as read in the database.
 */
export const markAsRead = async (notificationId, userId) => {
  if (!notificationId || !userId) return;
  const response = await axiosInstance.put(`/notifications/${notificationId}/read?userId=${userId}`);
  return response.data;
};

/**
 * Mark all notifications as read for the user.
 */
export const markAllAsRead = async (userId) => {
  if (!userId) return;
  const response = await axiosInstance.put(`/notifications/read-all?userId=${userId}`);
  return response.data;
};