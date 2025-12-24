import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return isAuthenticated ? (
        <Layout>
            <Outlet />
        </Layout>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedRoute;
