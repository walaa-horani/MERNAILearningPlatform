import axiosInstance from "../utils/axiosInstance";

// =====================
// Get all flashcard sets
// =====================
export const getFlashcardSets = async () => {
    try {
        const response = await axiosInstance.get("/flashcards");
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch flashcard sets",
        };
    }
};

// =====================
// Get flashcards for a document
// =====================
export const getFlashcardsForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(
            `/flashcards/${documentId}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch flashcards",
        };
    }
};

// =====================
// Review flashcard
// =====================
export const reviewFlashcard = async (cardId, cardIndex) => {
    try {
        const response = await axiosInstance.post(
            `/flashcards/${cardId}/review`,
            { cardIndex }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to review flashcard",
        };
    }
};

// =====================
// Toggle star
// =====================
export const toggleStar = async (cardId) => {
    try {
        const response = await axiosInstance.put(
            `/flashcards/${cardId}/star`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to star flashcard",
        };
    }
};

// =====================
// Toggle set star
// =====================
export const toggleSetStar = async (setId) => {
    try {
        const response = await axiosInstance.put(
            `/flashcards/set/${setId}/star`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to star flashcard set",
        };
    }
};
