import axiosInstance from "../utils/axiosInstance";

// =====================
// Get quizzes for a document
// =====================
export const getQuizzesForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(
            `/quizzes/${documentId}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch quizzes",
        };
    }
};

// =====================
// Get quiz by ID
// =====================
export const getQuizById = async (quizId) => {
    try {
        const response = await axiosInstance.get(
            `/quizzes/quiz/${quizId}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch quiz",
        };
    }
};

// =====================
// Submit quiz
// =====================
export const submitQuiz = async (quizId, answers) => {
    try {
        const response = await axiosInstance.post(
            `/quizzes/${quizId}/submit`,
            { answers }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to submit quiz",
        };
    }
};

// =====================
// Get quiz results
// =====================
export const getQuizResults = async (quizId) => {
    try {
        const response = await axiosInstance.get(
            `/quizzes/${quizId}/results`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch quiz results",
        };
    }
};

// =====================
// Delete quiz
// =====================
export const deleteQuiz = async (quizId) => {
    try {
        const response = await axiosInstance.delete(
            `/quizzes/${quizId}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to delete quiz",
        };
    }
};
