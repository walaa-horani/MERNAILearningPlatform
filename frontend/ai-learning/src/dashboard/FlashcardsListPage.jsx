import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as flashcardService from "../services/flashcardService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import StarIconSolid from "@heroicons/react/24/solid/StarIcon";
import StarIconOutline from "@heroicons/react/24/outline/StarIcon";

function FlashcardsListPage() {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchFlashcardSets();
    }, []);

    const fetchFlashcardSets = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await flashcardService.getFlashcardSets();
            setFlashcardSets(data.flashcards || data.data || []);
        } catch (err) {
            console.error("Failed to load flashcard sets:", err);
            if (!silent) setError(err.message || "Failed to load flashcard sets");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleToggleStar = async (e, setId) => {
        e.preventDefault();
        e.stopPropagation();

        const set = flashcardSets.find(s => s._id === setId);
        if (!set) return;

        // Optimistic update
        const updatedSets = flashcardSets.map(s =>
            s._id === setId ? { ...s, isStarred: !s.isStarred } : s
        );
        setFlashcardSets(updatedSets);

        try {
            await flashcardService.toggleSetStar(setId);
            fetchFlashcardSets(true); // Silent sync
        } catch (err) {
            console.error("Failed to toggle set star:", err);
            // Revert on error
            setFlashcardSets(flashcardSets);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchFlashcardSets} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">All Flashcards</h1>
                <p className="text-gray-600 mt-2">
                    Browse and study all your flashcard sets
                </p>
            </div>

            {/* Flashcard Sets Grid */}
            {flashcardSets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 mb-4">
                        No flashcard sets available yet
                    </p>
                    <Link
                        to="/documents"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Upload a Document to Get Started
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flashcardSets.map((set) => (
                        <div
                            key={set._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative group"
                        >
                            {/* Star Toggle Button */}
                            <button
                                onClick={(e) => handleToggleStar(e, set._id)}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-10 ${set.isStarred
                                    ? "text-yellow-500 bg-yellow-50"
                                    : "text-gray-300 hover:text-gray-400 bg-gray-50 opacity-0 group-hover:opacity-100"
                                    }`}
                            >
                                {set.isStarred ? (
                                    <StarIconSolid className="w-6 h-6" />
                                ) : (
                                    <StarIconOutline className="w-6 h-6" />
                                )}
                            </button>

                            <div className="flex items-start justify-between mb-4 pr-8">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {set.documentId?.title || "Flashcard Set"}
                                </h3>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total Cards</span>
                                    <span className="font-semibold text-gray-900">
                                        {set.cards?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Starred Cards</span>
                                    <span className="font-semibold text-yellow-600">
                                        {set.cards?.filter(c => c.isStarred).length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Reviewed</span>
                                    <span className="font-semibold text-blue-600">
                                        {set.cards?.filter(c => c.reviewCount > 0).length || 0}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to={`/documents/${set.documentId?._id}/flashcards`}
                                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                            >
                                Study Now
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FlashcardsListPage;