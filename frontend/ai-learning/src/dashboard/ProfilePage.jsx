import React from "react";
import { useAuth } from "../contexts/authContext";

function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-2">Manage your account information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-600">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Full Name
                        </h3>
                        <p className="text-lg font-medium text-gray-900">{user?.name}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Email Address
                        </h3>
                        <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Member Since
                        </h3>
                        <p className="text-lg font-medium text-gray-900">
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Account Status
                        </h3>
                        <p className="text-lg font-medium text-green-600">Active</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Your Learning Journey</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="text-sm text-blue-100">Total Documents</p>
                        <p className="text-3xl font-bold mt-2">-</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                        <div className="text-4xl mb-2">🗂️</div>
                        <p className="text-sm text-blue-100">Flashcards Studied</p>
                        <p className="text-3xl font-bold mt-2">-</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-sm text-blue-100">Quizzes Completed</p>
                        <p className="text-3xl font-bold mt-2">-</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;