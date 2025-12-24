
// =====================
// Get Documents

import axiosInstance from "../utils/axiosInstance";

// =====================
export const getDocuments = async () => {
    try {
        const response = await axiosInstance.get("/documents");
        return response.data.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch documents",
        };
    }
};

// =====================
// Get Document by ID
// =====================
export const getDocumentById = async (id) => {
    try {
        const response = await axiosInstance.get(`/documents/${id}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to fetch document",
        };
    }
};

// =====================
// Upload Document
// =====================
export const uploadDocument = async (formData) => {
    try {
        const response = await axiosInstance.post(
            "/documents/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to upload document",
        };
    }
};

// =====================
// Update Document
// =====================
export const updateDocument = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/documents/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to update document",
        };
    }
};

// =====================
// Delete Document
// =====================
export const deleteDocument = async (id) => {
    try {
        const response = await axiosInstance.delete(`/documents/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: "Failed to delete document",
        };
    }
};

