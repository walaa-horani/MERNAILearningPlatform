import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import DashboardPage from "./dashboard/DashboardPage";
import DocumentListPage from "./dashboard/DocumentListPage";
import DocumentDetailPage from "./dashboard/DocumentDetailPage";
import FlashcardsPage from "./dashboard/FlashcardsPage";
import FlashcardsListPage from "./dashboard/FlashcardsListPage";
import QuizTakePage from "./dashboard/QuizTakePage";
import QuizResultPage from "./dashboard/QuizResultPage";
import ProfilePage from "./dashboard/ProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
