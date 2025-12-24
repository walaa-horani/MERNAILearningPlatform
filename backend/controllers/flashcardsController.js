// @desc    Get all flashcards for a document
// @route   GET /api/flashcards/:documentId

import Flashcard from "../models/Flashcards.js";

// @access  Private
export const getFlashcards = async (req, res, next) => {
    try {
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: req.params.documentId,
        })
            .populate("documentId", "title fileName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all flashcard sets for a user
// @route   GET /api/flashcards
// @access  Private
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await Flashcard.find({
            userId: req.user._id,
        })
            .populate("documentId", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Mark flashcard as reviewed
// @route   POST /api/flashcards/:cardId/review
// @access  Private
export const reviewFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            "cards._id": req.params.cardId,
            userId: req.user._id,
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: "Flashcard set or card not found",
                statusCode: 404,
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(
            (card) => card._id.toString() === req.params.cardId
        );

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Card not found in set",
                statusCode: 404,
            });
        }

        //     flashcardSet.cards = [
        //   { _id: "a1", question: "Q1" }, // index 0
        //   { _id: "b2", question: "Q2" }, // index 1
        //   { _id: "c3", question: "Q3" }  // index 2
        // ];

        // Update review info
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: "Flashcard reviewed successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle star/favorite on flashcard
// @route   PUT /api/flashcards/:cardId/star
// @access  Private
export const toggleStarFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            "cards._id": req.params.cardId,
            userId: req.user._id,
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: "Flashcard set or card not found",
                statusCode: 404,
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(
            (card) => card._id.toString() === req.params.cardId
        );

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Card not found in set",
                statusCode: 404,
            });
        }

        // Toggle star
        flashcardSet.cards[cardIndex].isStarred =
            !flashcardSet.cards[cardIndex].isStarred;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? "starred" : "unstarred"
                }`,
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Toggle star on entire flashcard set
// @route   PUT /api/flashcards/set/:id/star
// @access  Private
export const toggleSetStar = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: "Flashcard set not found",
                statusCode: 404,
            });
        }

        flashcardSet.isStarred = !flashcardSet.isStarred;
        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `Flashcard set ${flashcardSet.isStarred ? "starred" : "unstarred"
                }`,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete flashcard set
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcardSet = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: "Flashcard set not found",
                statusCode: 404,
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: "Flashcard set deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
