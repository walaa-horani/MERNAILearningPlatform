import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as quizService from "../services/quizServices";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function QuizResultPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchResults();
    }, [quizId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await quizService.getQuizResults(quizId);
            // Backend returns: { success: true, data: { quiz, results: [...] } }
            setResults(response.data || null);
        } catch (err) {
            setError(err.message || "Failed to load quiz results");
        } finally {
            setLoading(false);
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
        return <ErrorMessage message={error} onRetry={fetchResults} />;
    }

    const quizInfo = results?.quiz || {};
    const score = quizInfo.score || 0;
    const totalQuestions = quizInfo.totalQuestions || 0;
    const questions = results?.results || [];
    const correctAnswers = questions.filter(q => q.isCorrect).length;
    const percentage = quizInfo.score || 0;
    const userAnswers = results?.results || [];

    const getScoreColor = (percent) => {
        if (percent >= 80) return "text-green-600";
        if (percent >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreMessage = (percent) => {
        if (percent >= 90) return "🎉 Excellent! Outstanding performance!";
        if (percent >= 80) return "👏 Great job! You did very well!";
        if (percent >= 70) return "👍 Good work! Keep it up!";
        if (percent >= 60) return "😊 Not bad! Room for improvement.";
        return "📚 Keep studying! You'll do better next time.";
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
                    <p className="text-blue-100 mb-6">{results?.quiz?.title}</p>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-6">
                        <div className={`text-7xl font-bold mb-2 ${getScoreColor(percentage)}`}>
                            {percentage}%
                        </div>
                        <p className="text-xl">
                            {correctAnswers} out of {totalQuestions} correct
                        </p>
                    </div>

                    <p className="text-xl font-semibold">{getScoreMessage(percentage)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate(`/quizzes/${quizId}`)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                    🔄 Retake Quiz
                </button>
                <Link
                    to="/dashboard"
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-center"
                >
                    🏠 Dashboard
                </Link>
                <Link
                    to="/documents"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
                >
                    📄 Documents
                </Link>
            </div>

            {/* Question Review */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Question Review
                </h2>

                <div className="space-y-6">
                    {questions.map((question, qIndex) => {
                        const userAnswer = userAnswers[qIndex];
                        const isCorrect = userAnswer?.selectedAnswer === question.correctAnswer;

                        return (
                            <div
                                key={qIndex}
                                className={`border-2 rounded-lg p-6 ${isCorrect
                                    ? "border-green-200 bg-green-50"
                                    : "border-red-200 bg-red-50"
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isCorrect
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                            }`}
                                    >
                                        {qIndex + 1}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            {question.question}
                                        </h3>

                                        <div className="space-y-2">
                                            {question.options?.map((option, oIndex) => {
                                                const isUserAnswer =
                                                    userAnswer?.selectedAnswer === oIndex;
                                                const isCorrectAnswer =
                                                    question.correctAnswer === oIndex;

                                                let className =
                                                    "p-3 rounded-lg border-2 ";

                                                if (isCorrectAnswer) {
                                                    className +=
                                                        "border-green-500 bg-green-100";
                                                } else if (
                                                    isUserAnswer &&
                                                    !isCorrectAnswer
                                                ) {
                                                    className += "border-red-500 bg-red-100";
                                                } else {
                                                    className += "border-gray-200 bg-white";
                                                }

                                                return (
                                                    <div key={oIndex} className={className}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-900">
                                                                {option}
                                                            </span>
                                                            <div className="flex items-center space-x-2">
                                                                {isCorrectAnswer && (
                                                                    <span className="text-green-600 font-semibold">
                                                                        ✓ Correct
                                                                    </span>
                                                                )}
                                                                {isUserAnswer &&
                                                                    !isCorrectAnswer && (
                                                                        <span className="text-red-600 font-semibold">
                                                                            ✗ Your Answer
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {question.explanation && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">
                                                    💡 Explanation:
                                                </p>
                                                <p className="text-sm text-blue-800">
                                                    {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default QuizResultPage;