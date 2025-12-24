import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as documentService from "../services/documentServices";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function DocumentListPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await documentService.getDocuments();
            setDocuments(data);
        } catch (err) {
            setError(err.message || "Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const file = formData.get("file");
        const title = formData.get("title");

        if (!file || !title) {
            setUploadError("Please provide both file and title");
            return;
        }

        try {
            setUploading(true);
            setUploadError("");
            await documentService.uploadDocument(formData);
            e.target.reset();
            fetchDocuments();
        } catch (err) {
            setUploadError(err.message || "Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this document?")) {
            return;
        }

        try {
            await documentService.deleteDocument(id);
            fetchDocuments();
        } catch (err) {
            alert(err.message || "Failed to delete document");
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            processing: "bg-yellow-100 text-yellow-800",
            ready: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || "bg-gray-100 text-gray-800"
                    }`}
            >
                {status?.toUpperCase() || "UNKNOWN"}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
                <p className="text-gray-600 mt-2">
                    Upload and manage your learning documents
                </p>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Upload New Document
                </h2>

                {uploadError && (
                    <div className="mb-4">
                        <ErrorMessage message={uploadError} />
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Introduction to Machine Learning"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PDF File
                            </label>
                            <input
                                type="file"
                                name="file"
                                accept=".pdf"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {uploading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <span>📤</span>
                                <span>Upload Document</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Your Documents
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="p-6">
                        <ErrorMessage message={error} onRetry={fetchDocuments} />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            No documents uploaded yet. Upload your first document above!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Flashcards
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quizzes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {doc.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(doc.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doc.flashcardCount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doc.quizCount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <Link
                                                to={`/documents/${doc._id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(doc._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentListPage;