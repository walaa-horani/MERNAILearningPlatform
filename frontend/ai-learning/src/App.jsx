// Triggering Vercel redeploy to activate routing fixes
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { AuthProvider } from "./contexts/authContext";
import ProtectedRoute from "./auth/ProtectedRoute";

const LoginPage = React.lazy(() => import("./auth/LoginPage"));
const RegisterPage = React.lazy(() => import("./auth/RegisterPage"));
const DashboardPage = React.lazy(() => import("./dashboard/DashboardPage"));
const DocumentListPage = React.lazy(() => import("./dashboard/DocumentListPage"));
const DocumentDetailPage = React.lazy(() => import("./dashboard/DocumentDetailPage"));
const FlashcardsPage = React.lazy(() => import("./dashboard/FlashcardsPage"));
const FlashcardsListPage = React.lazy(() => import("./dashboard/FlashcardsListPage"));
const QuizTakePage = React.lazy(() => import("./dashboard/QuizTakePage"));
const QuizResultPage = React.lazy(() => import("./dashboard/QuizResultPage"));
const ProfilePage = React.lazy(() => import("./dashboard/ProfilePage"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route
                path="/documents/:id/flashcards"
                element={<FlashcardsPage />}
              />
              <Route path="/flashcards" element={<FlashcardsListPage />} />
              <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
              <Route
                path="/quizzes/:quizId/results"
                element={<QuizResultPage />}
              />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
