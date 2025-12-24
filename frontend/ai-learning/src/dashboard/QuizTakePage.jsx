import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as quizService from "../services/quizServices";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function QuizTakePage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await quizService.getQuizById(quizId);
            // Backend returns: { success: true, data: { ...quizData } }
            setQuiz(response.data || null);
        } catch (err) {
            setError(err.message || "Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        setAnswers({
            ...answers,
            [questionIndex]: answerIndex,
        });
    };

    const handleSubmit = async () => {
        const totalQuestions = quiz.questions?.length || 0;
        const answeredQuestions = Object.keys(answers).length;

        if (answeredQuestions < totalQuestions) {
            if (
                !confirm(
                    `You have only answered ${answeredQuestions} out of ${totalQuestions} questions. Submit anyway?`
                )
            ) {
                return;
            }
        }

        try {
            setSubmitting(true);
            const formattedAnswers = Object.entries(answers).map(
                ([questionIndex, selectedAnswer]) => ({
                    questionIndex: parseInt(questionIndex),
                    selectedAnswer,
                })
            );

            await quizService.submitQuiz(quizId, formattedAnswers);
            navigate(`/quizzes/${quizId}/results`);
        } catch (err) {
            setError(err.message || "Failed to submit quiz");
        } finally {
            setSubmitting(false);
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
        return <ErrorMessage message={error} onRetry={fetchQuiz} />;
    }

    const questions = quiz?.questions || [];
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-3xl font-bold text-gray-900">{quiz?.title}</h1>
                <div className="flex items-center justify-between mt-4">
                    <p className="text-gray-600">
                        {totalQuestions} Questions • {answeredQuestions} Answered
                    </p>
                    <div className="text-sm text-gray-600">
                        Progress: {Math.round(progress)}%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {questions.map((question, qIndex) => (
                    <div
                        key={qIndex}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                {qIndex + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {question.question}
                                </h3>

                                <div className="space-y-3">
                                    {question.options?.map((option, oIndex) => (
                                        <label
                                            key={oIndex}
                                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[qIndex] === oIndex
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                checked={answers[qIndex] === oIndex}
                                                onChange={() =>
                                                    handleAnswerSelect(qIndex, oIndex)
                                                }
                                                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-gray-900">
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-900 font-semibold">
                            Ready to submit your quiz?
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            You have answered {answeredQuestions} out of {totalQuestions}{" "}
                            questions
                        </p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || answeredQuestions === 0}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center space-x-2"
                    >
                        {submitting ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <span>✅</span>
                                <span>Submit Quiz</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuizTakePage;