import axiosInstance from "../utils/axiosInstance";

// =====================
// Get Dashboard Data
// =====================
export const getDashboard = async () => {
    try {
        const response = await axiosInstance.get("/progress/dashboard");
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch dashboard data",
        };
    }
};
