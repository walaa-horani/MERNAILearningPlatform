import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as flashcardService from "../services/flashcardService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import StarIconSolid from "@heroicons/react/24/solid/StarIcon";
import StarIconOutline from "@heroicons/react/24/outline/StarIcon";

function FlashcardsPage() {
    const { id: documentId } = useParams();
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Check if documentId exists
    if (!documentId) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">No document ID provided</p>
                <p className="text-gray-600 mb-4">Please access flashcards from a document page</p>
                <button
                    onClick={() => navigate("/documents")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Documents
                </button>
            </div>
        );
    }

    useEffect(() => {
        fetchFlashcards();
    }, [documentId]);

    const fetchFlashcards = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await flashcardService.getFlashcardsForDocument(documentId);

            console.log("Flashcards response:", response);

            // Backend returns: { success: true, count: 1, data: [{ _id, cards: [...] }] }
            const flashcardSets = response.data || [];

            if (flashcardSets.length > 0 && flashcardSets[0].cards) {
                setFlashcards(flashcardSets[0].cards);
            } else {
                setFlashcards([]);
            }
        } catch (err) {
            console.error("Error fetching flashcards:", err);
            if (!silent) setError(err.message || "Failed to load flashcards");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleReview = async (difficulty) => {
        try {
            const currentCardId = flashcards[currentIndex]?._id;
            if (!currentCardId) return;
            await flashcardService.reviewFlashcard(currentCardId, currentIndex);
            handleNext();
        } catch (err) {
            console.error("Failed to review flashcard:", err);
            handleNext();
        }
    };

    const handleToggleStar = async () => {
        const currentCard = flashcards[currentIndex];
        if (!currentCard?._id) return;

        // Optimistic update
        const updatedCards = [...flashcards];
        const newStarredStatus = !currentCard.isStarred;
        updatedCards[currentIndex] = {
            ...currentCard,
            isStarred: newStarredStatus
        };
        setFlashcards(updatedCards);

        try {
            await flashcardService.toggleStar(currentCard._id);
            // Silently refresh to ensure we're in sync
            fetchFlashcards(true);
        } catch (err) {
            console.error("Failed to toggle star:", err);
            // Revert optimistic update on error
            const revertedCards = [...flashcards];
            revertedCards[currentIndex] = {
                ...currentCard,
                isStarred: !newStarredStatus
            };
            setFlashcards(revertedCards);
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
        return <ErrorMessage message={error} onRetry={fetchFlashcards} />;
    }

    if (flashcards.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No flashcards available for this document</p>
                <button
                    onClick={() => navigate(`/documents/${documentId}`)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Generate Flashcards
                </button>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Study Flashcards</h1>
                    <p className="text-gray-600 mt-2">
                        Card {currentIndex + 1} of {flashcards.length}
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/documents/${documentId}`)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    ← Back
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                        width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                    }}
                ></div>
            </div>

            {/* Flashcard */}
            <div className="relative group">
                <div
                    onClick={handleFlip}
                    className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-12 min-h-[450px] flex items-center justify-center cursor-pointer hover:shadow-2xl transition-all duration-500"
                    style={{
                        transformStyle: "preserve-3d",
                        perspective: "1000px",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* Front */}
                    <div
                        className="w-full text-center"
                        style={{
                            backfaceVisibility: "hidden",
                            position: isFlipped ? "absolute" : "relative",
                        }}
                    >
                        <div className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-8">
                            Front
                        </div>
                        <p className="text-3xl font-bold text-gray-800 leading-relaxed">
                            {currentCard.front || currentCard.question}
                        </p>
                    </div>

                    {/* Back */}
                    <div
                        className="w-full text-center"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            position: !isFlipped ? "absolute" : "relative",
                        }}
                    >
                        <div className="text-xs font-bold text-green-500 tracking-widest uppercase mb-8">
                            Answer
                        </div>
                        <p className="text-3xl font-bold text-gray-800 leading-relaxed">
                            {currentCard.back || currentCard.answer}
                        </p>
                    </div>
                </div>

                {/* Star Button */}
                <div className="absolute top-6 right-6">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar();
                        }}
                        className={`p-3 rounded-full transition-all duration-200 ${currentCard.isStarred
                            ? "bg-yellow-50 text-yellow-500 shadow-sm"
                            : "bg-gray-50 text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {currentCard.isStarred ? (
                            <StarIconSolid className="w-8 h-8" />
                        ) : (
                            <StarIconOutline className="w-8 h-8" />
                        )}
                    </button>
                </div>
            </div>

            {/* Instructions */}
            <div className="text-center text-gray-600">
                <p>Click the card to flip it</p>
            </div>

            {/* Review Buttons */}
            {isFlipped && (
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => handleReview("hard")}
                        className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                    >
                        😓 Hard
                    </button>
                    <button
                        onClick={() => handleReview("medium")}
                        className="px-6 py-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-semibold"
                    >
                        😐 Medium
                    </button>
                    <button
                        onClick={() => handleReview("easy")}
                        className="px-6 py-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold"
                    >
                        😊 Easy
                    </button>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    ← Previous
                </button>

                <div className="text-gray-600 font-medium">
                    {currentIndex + 1} / {flashcards.length}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === flashcards.length - 1}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    Next →
                </button>
            </div>

            {/* Exit Button */}
            {currentIndex === flashcards.length - 1 && (
                <div className="text-center">
                    <button
                        onClick={() => navigate(`/documents/${documentId}`)}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                        ✅ Finish Study Session
                    </button>
                </div>
            )}
        </div>
    );
}

export default FlashcardsPage;