import axiosInstance from "../../config/axiosConfig";

/**
 * Fetches all talukas or talukas filtered by role.
 * @param {string} role - Optional role to filter talukas.
 * @returns {Promise<Array>} - List of taluka strings.
 */
export const getTalukas = async (role = null) => {
  const params = role ? { role } : {};
  const response = await axiosInstance.get("/talukas/talukas", { params });
  // The API returns List<TalukaDTO>, extract the string
  return response.data.map(item => item.taluka);
};

/**
 * Fetches villages for a specific taluka.
 * @param {string} taluka - The name of the taluka.
 * @param {string} role - Optional role to filter villages.
 * @returns {Promise<Array>} - List of village strings.
 */
export const getVillagesByTaluka = async (taluka, role = null) => {
  if (!taluka) return [];
  const params = role ? { role } : {};
  const response = await axiosInstance.get(`/talukas/villages/${taluka}`, { params });
  // The API returns List<VillageDTO>, extract the string
  return response.data.map(item => item.village);
};
