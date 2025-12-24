import axiosInstance from "../utils/axiosInstance";

// =====================
// Register User
// =====================
export const register = async (name, email, password) => {
    try {
        const response = await axiosInstance.post("/auth/register", {
            username: name, // Backend expects 'username', not 'name'
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to register",
        };
    }
};

// =====================
// Login User
// =====================
export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post("/auth/login", {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to login",
        };
    }
};

// =====================
// Get Current User
// =====================
export const getMe = async () => {
    try {
        const response = await axiosInstance.get("/auth/me");
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch user data",
        };
    }
};

// =====================
// Logout User
// =====================
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
