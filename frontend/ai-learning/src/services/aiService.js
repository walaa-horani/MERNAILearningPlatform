import axiosInstance from "../utils/axiosInstance";

// =====================
// Generate Flashcards
// =====================
export const generateFlashcards = async (documentId, count) => {
    try {
        const response = await axiosInstance.post("/ai/generate-flashcards", {
            documentId,
            count,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to generate flashcards",
        };
    }
};

// =====================
// Generate Quiz
// =====================
export const generateQuiz = async (documentId, numQuestions, title) => {
    try {
        const response = await axiosInstance.post("/ai/generate-quiz", {
            documentId,
            numQuestions,
            title,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to generate quiz",
        };
    }
};

// =====================
// Generate Summary
// =====================
export const generateSummary = async (documentId) => {
    try {
        const response = await axiosInstance.post("/ai/generate-summary", {
            documentId,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to generate summary",
        };
    }
};

// =====================
// Chat with Document
// =====================
export const chatWithDocument = async (documentId, question) => {
    try {
        const response = await axiosInstance.post("/ai/chat", {
            documentId,
            question,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to chat with document",
        };
    }
};

// =====================
// Explain Concept
// =====================
export const explainConcept = async (documentId, concept) => {
    try {
        const response = await axiosInstance.post("/ai/explain-concept", {
            documentId,
            concept,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to explain concept",
        };
    }
};

// =====================
// Get Chat History
// =====================
export const getChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.get(`/ai/chat/${documentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch chat history",
        };
    }
};
