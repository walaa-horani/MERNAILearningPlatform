// @desc    Get all quizzes for a document
// @route   GET /api/quizzes/:documentId

import Quiz from "../models/Quiz.js";

// @access  Private
export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId,
        })
            .populate("documentId", "title fileName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        next(error);
    }
};


// @access  Private
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found",
                statusCode: 404,
            });
        }

        res.status(200).json({
            success: true,
            data: quiz,
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        console.log("=== SUBMIT QUIZ STARTED ===");
        console.log("Quiz ID:", req.params.id);
        console.log("Answers received:", JSON.stringify(answers));

        // Validate answers
        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: "Please provide answers array",
                statusCode: 400,
            });
        }

        // Get quiz
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found",
                statusCode: 404,
            });
        }

        // Process answers
        let correctCount = 0;
        const userAnswers = [];

        // Map through all original questions to ensure we evaluate everything
        quiz.questions.forEach((question, index) => {
            // Find if user provided an answer for this question index
            const answer = answers.find((a) => a.questionIndex === index);

            if (answer) {
                const { selectedAnswer } = answer;

                // selectedAnswer is the index (0-3) from frontend
                // question.correctAnswer is the TEXT from Gemini
                // question.options[selectedAnswer] is the TEXT of the selected option

                const selectedText = question.options[selectedAnswer];
                const isCorrect = selectedText === question.correctAnswer;

                if (isCorrect) correctCount++;

                userAnswers.push({
                    questionIndex: index,
                    selectedAnswer: selectedAnswer.toString(), // Store index as string as per schema
                    isCorrect,
                    answeredAt: new Date(),
                });
            }
        });

        // Calculate score
        const totalQuestions = quiz.totalQuestions || quiz.questions.length || 1;
        const score = Math.round((correctCount / totalQuestions) * 100);

        console.log(`Quiz Results: ${correctCount}/${totalQuestions} = ${score}%`);

        // Update quiz (allowing retakes)
        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        console.log("=== QUIZ SUBMITTED SUCCESSFULLY ===");

        res.status(200).json({
            success: true,
            data: {
                score,
                correctCount,
                totalQuestions,
                percentage: score,
                userAnswers,
            },
            message: "Quiz submitted successfully",
        });
    } catch (error) {
        console.error("=== SUBMIT QUIZ ERROR ===");
        console.error(error);
        next(error);
    }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        }).populate("documentId", "title");

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found",
                statusCode: 404,
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: "Quiz not completed yet",
                statusCode: 400,
            });
        }

        // Build detailed results
        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(
                (a) => a.questionIndex === index
            );

            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                    completedAt: quiz.completedAt,
                },
                results: detailedResults,
            },
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found",
                statusCode: 404,
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: "Quiz deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

