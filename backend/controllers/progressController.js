import Document from "../models/Document.js";
import Flashcard from "../models/Flashcards.js";
import Quiz from "../models/Quiz.js";

// @desc    Get user learning statistics
// @route   GET /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Run independent database queries concurrently to improve performance
        const [
            totalDocuments,
            flashcardSets,
            totalQuizzes,
            completedQuizzes,
            quizzes,
            recentDocuments,
            recentQuizzes
        ] = await Promise.all([
            Document.countDocuments({ userId }),
            Flashcard.find({ userId }),
            Quiz.countDocuments({ userId }),
            Quiz.countDocuments({ userId, completedAt: { $ne: null } }),
            Quiz.find({ userId, completedAt: { $ne: null } }),
            Document.find({ userId })
                .sort({ lastAccessed: -1 })
                .limit(5)
                .select("title fileName lastAccessed status"),
            Quiz.find({ userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("documentId", "title")
                .select("title score totalQuestions completedAt")
        ]);

        const totalFlashcardSets = flashcardSets.length;

        // =========================
        // Flashcard statistics
        // =========================
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;
        let starredSets = 0;

        flashcardSets.forEach((set) => {
            if (set.isStarred) starredSets++;
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(
                (c) => c.reviewCount > 0
            ).length;
            starredFlashcards += set.cards.filter(
                (c) => c.isStarred
            ).length;
        });

        // =========================
        // Quiz statistics
        // =========================
        const averageScore =
            quizzes.length > 0
                ? Math.round(
                    quizzes.reduce((sum, q) => sum + q.score, 0) /
                    quizzes.length
                )
                : 0;


        // =========================
        // Study streak (mock)
        // =========================
        const studyStreak = Math.floor(Math.random() * 7) + 1;

        // =========================
        // Response
        // =========================
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    starredSets,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    studyStreak,
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes,
                },

            },
        });
    } catch (error) {
        next(error);
    }
};
