import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as progressService from "../services/progressService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const data = await progressService.getDashboard();
            setDashboardData(data);
        } catch (err) {
            setError(err.message || "Failed to load dashboard");
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
        return <ErrorMessage message={error} onRetry={fetchDashboard} />;
    }

    const overview = dashboardData?.data?.overview || {};
    const recentQuizzes = dashboardData?.data?.recentActivity?.quizzes || [];

    const stats = [
        {
            label: "Total Documents",
            value: overview.totalDocuments || 0,
            icon: "📄",
            color: "bg-blue-100 text-blue-600",
        },
        {
            label: "Total Flashcards",
            value: overview.totalFlashcards || 0,
            icon: "🗂️",
            color: "bg-green-100 text-green-600",
        },
        {
            label: "Reviewed Cards",
            value: overview.reviewedFlashcards || 0,
            icon: "✅",
            color: "bg-purple-100 text-purple-600",
        },
        {
            label: "Total Quizzes",
            value: overview.totalQuizzes || 0,
            icon: "📝",
            color: "bg-yellow-100 text-yellow-600",
        },
        {
            label: "Completed Quizzes",
            value: overview.completedQuizzes || 0,
            icon: "🎯",
            color: "bg-indigo-100 text-indigo-600",
        },
        {
            label: "Average Score",
            value: `${overview.averageScore || 0}%`,
            icon: "📊",
            color: "bg-pink-100 text-pink-600",
        },

        {
            label: "Starred Cards",
            value: overview.starredSets || 0,
            icon: "⭐",
            color: "bg-orange-100 text-orange-600",
        },

    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Track your learning progress and achievements
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Quizzes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Recent Quizzes
                    </h2>
                    <Link
                        to="/documents"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        View All →
                    </Link>
                </div>

                {recentQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">
                            No quizzes taken yet
                        </p>
                        <Link
                            to="/documents"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Upload a Document to Get Started
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentQuizzes.map((quiz) => (
                            <div
                                key={quiz._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {quiz.questions?.length || 0} questions
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {quiz.completed && (
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">
                                                {quiz.score}%
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Score
                                            </p>
                                        </div>
                                    )}
                                    <Link
                                        to={
                                            quiz.completed
                                                ? `/quizzes/${quiz._id}/results`
                                                : `/quizzes/${quiz._id}`
                                        }
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        {quiz.completed ? "View Results" : "Take Quiz"}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/documents"
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">📄</div>
                    <h3 className="text-xl font-bold mb-2">Upload Document</h3>
                    <p className="text-blue-100">
                        Upload a PDF to start learning
                    </p>
                </Link>

                <Link
                    to="/flashcards"
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">🗂️</div>
                    <h3 className="text-xl font-bold mb-2">Study Flashcards</h3>
                    <p className="text-green-100">
                        Review your flashcard sets
                    </p>
                </Link>

                <Link
                    to="/profile"
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                >
                    <div className="text-4xl mb-3">👤</div>
                    <h3 className="text-xl font-bold mb-2">View Profile</h3>
                    <p className="text-purple-100">
                        Manage your account settings
                    </p>
                </Link>
            </div>
        </div>
    );
}

export default DashboardPage;