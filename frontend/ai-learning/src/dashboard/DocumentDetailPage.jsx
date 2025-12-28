import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as documentService from "../services/documentServices";
import * as aiService from "../services/aiService";
import * as quizService from "../services/quizServices";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function DocumentDetailPage() {
    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // AI Actions State
    const [activeTab, setActiveTab] = useState("overview");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiSuccess, setAiSuccess] = useState("");

    // Chat State
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [quizzesLoading, setQuizzesLoading] = useState(false);

    // Form States
    const [flashcardCount, setFlashcardCount] = useState(10);
    const [quizQuestions, setQuizQuestions] = useState(5);
    const [quizTitle, setQuizTitle] = useState("");
    const [conceptText, setConceptText] = useState("");
    const [summary, setSummary] = useState("");

    useEffect(() => {
        fetchDocument();
    }, [id]);

    useEffect(() => {
        if (activeTab === "chat") {
            fetchChatHistory();
        }
        if (activeTab === "quizzes") {
            fetchQuizzes();
        }
    }, [activeTab]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const data = await documentService.getDocumentById(id);
            setDocument(data);
        } catch (err) {
            setError(err.message || "Failed to load document");
        } finally {
            setLoading(false);
        }
    };

    const fetchChatHistory = async () => {
        try {
            const data = await aiService.getChatHistory(id);
            setChatMessages(data.messages || []);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    };

    const fetchQuizzes = async () => {
        try {
            setQuizzesLoading(true);
            const data = await quizService.getQuizzesForDocument(id);
            setQuizzes(data.data || []);
        } catch (err) {
            console.error("Failed to load quizzes:", err);
        } finally {
            setQuizzesLoading(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        try {
            setAiLoading(true);
            setAiError("");
            setAiSuccess("");
            await aiService.generateFlashcards(id, flashcardCount);
            setAiSuccess(`Successfully generated ${flashcardCount} flashcards!`);
            fetchDocument();
        } catch (err) {
            setAiError(err.message || "Failed to generate flashcards");
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        try {
            setAiLoading(true);
            setAiError("");
            setAiSuccess("");
            await aiService.generateQuiz(id, quizQuestions, quizTitle);
            setAiSuccess(`Successfully generated quiz: ${quizTitle}!`);
            setQuizTitle("");
            fetchDocument();
            fetchQuizzes();
        } catch (err) {
            setAiError(err.message || "Failed to generate quiz");
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        try {
            setAiLoading(true);
            setAiError("");
            setSummary("");
            const data = await aiService.generateSummary(id);
            setSummary(data.summary || "Summary generated successfully!");
        } catch (err) {
            setAiError(err.message || "Failed to generate summary");
        } finally {
            setAiLoading(false);
        }
    };

    const handleExplainConcept = async () => {
        try {
            setAiLoading(true);
            setAiError("");
            const data = await aiService.explainConcept(id, conceptText);
            setChatMessages([
                ...chatMessages,
                { role: "user", content: `Explain: ${conceptText}` },
                { role: "assistant", content: data.explanation || data.answer },
            ]);
            setConceptText("");
        } catch (err) {
            setAiError(err.message || "Failed to explain concept");
        } finally {
            setAiLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        setChatInput("");
        setChatMessages([...chatMessages, { role: "user", content: userMessage }]);

        try {
            setChatLoading(true);
            const data = await aiService.chatWithDocument(id, userMessage);
            setChatMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.answer || data.response },
            ]);
        } catch (err) {
            setChatMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I couldn't process your question. Please try again.",
                },
            ]);
        } finally {
            setChatLoading(false);
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
        return <ErrorMessage message={error} onRetry={fetchDocument} />;
    }

    const isReady = document?.status === "ready";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {document?.title}
                        </h1>
                        <div className="flex items-center space-x-4 mt-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${document?.status === "ready"
                                    ? "bg-green-100 text-green-800"
                                    : document?.status === "processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {document?.status?.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">
                                📄 {document?.flashcardCount || 0} Flashcards
                            </span>
                            <span className="text-sm text-gray-600">
                                📝 {document?.quizCount || 0} Quizzes
                            </span>
                        </div>
                    </div>
                    <Link
                        to="/documents"
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← Back
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: "overview", label: "Overview", icon: "📊" },
                            { id: "flashcards", label: "Flashcards", icon: "🗂️" },
                            { id: "quizzes", label: "Quizzes", icon: "📝" },
                            { id: "summary", label: "Summary", icon: "📋" },
                            { id: "chat", label: "Chat", icon: "💬" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {!isReady && activeTab !== "overview" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800">
                                ⚠️ Document is still processing. AI features will be available
                                once processing is complete.
                            </p>
                        </div>
                    )}

                    {aiError && (
                        <div className="mb-6">
                            <ErrorMessage message={aiError} />
                        </div>
                    )}

                    {aiSuccess && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800">✅ {aiSuccess}</p>
                        </div>
                    )}

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="text-3xl mb-2">📄</div>
                                    <h3 className="font-semibold text-gray-900">Status</h3>
                                    <p className="text-2xl font-bold text-blue-600 mt-2">
                                        {document?.status}
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-6">
                                    <div className="text-3xl mb-2">🗂️</div>
                                    <h3 className="font-semibold text-gray-900">Flashcards</h3>
                                    <p className="text-2xl font-bold text-green-600 mt-2">
                                        {document?.flashcardCount || 0}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <div className="text-3xl mb-2">📝</div>
                                    <h3 className="font-semibold text-gray-900">Quizzes</h3>
                                    <p className="text-2xl font-bold text-purple-600 mt-2">
                                        {document?.quizCount || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link
                                        to={`/documents/${id}/flashcards`}
                                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                                    >
                                        <span className="font-medium">Study Flashcards</span>
                                        <span>→</span>
                                    </Link>
                                    <button
                                        onClick={() => setActiveTab("chat")}
                                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                                    >
                                        <span className="font-medium">Chat with Document</span>
                                        <span>→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flashcards Tab */}
                    {activeTab === "flashcards" && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Generate Flashcards
                                </h3>
                                <div className="flex items-end space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Flashcards
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={flashcardCount}
                                            onChange={(e) =>
                                                setFlashcardCount(parseInt(e.target.value))
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerateFlashcards}
                                        disabled={!isReady || aiLoading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {aiLoading ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            <>
                                                <span>✨</span>
                                                <span>Generate</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {document?.flashcardCount > 0 && (
                                <Link
                                    to={`/documents/${id}/flashcards`}
                                    className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                                >
                                    Study {document.flashcardCount} Flashcards →
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Quizzes Tab */}
                    {activeTab === "quizzes" && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Generate Quiz
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quiz Title
                                        </label>
                                        <input
                                            type="text"
                                            value={quizTitle}
                                            onChange={(e) => setQuizTitle(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Chapter 1 Quiz"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Questions
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={quizQuestions}
                                            onChange={(e) =>
                                                setQuizQuestions(parseInt(e.target.value))
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={!isReady || aiLoading || !quizTitle}
                                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {aiLoading ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            <>
                                                <span>✨</span>
                                                <span>Generate Quiz</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Existing Quizzes List */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Your Quizzes ({quizzes.length})
                                </h3>
                                {quizzesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : quizzes.length === 0 ? (
                                    <p className="text-gray-500 italic">No quizzes generated for this document yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {quizzes.map((quiz) => (
                                            <div
                                                key={quiz._id}
                                                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {quiz.questions.length} Questions • Generated on {new Date(quiz.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/quizzes/${quiz._id}`}
                                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                                    >
                                                        Take Quiz
                                                    </Link>
                                                    {quiz.attempts > 0 && (
                                                        <Link
                                                            to={`/quizzes/${quiz._id}/results`}
                                                            className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                                        >
                                                            View Last Result
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Summary Tab */}
                    {activeTab === "summary" && (
                        <div className="space-y-6">
                            <button
                                onClick={handleGenerateSummary}
                                disabled={!isReady || aiLoading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {aiLoading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <span>✨</span>
                                        <span>Generate Summary</span>
                                    </>
                                )}
                            </button>

                            {summary && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Document Summary
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === "chat" && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-6 h-96 overflow-y-auto">
                                {chatMessages.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-12">
                                        Start a conversation about this document
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {chatMessages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.role === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === "user"
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white border border-gray-200 text-gray-900"
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                                                    <LoadingSpinner size="sm" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleChatSubmit} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={!isReady || chatLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="Ask a question about this document..."
                                />
                                <button
                                    type="submit"
                                    disabled={!isReady || chatLoading || !chatInput.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Send
                                </button>
                            </form>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Explain a Concept
                                </h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={conceptText}
                                        onChange={(e) => setConceptText(e.target.value)}
                                        disabled={!isReady || aiLoading}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        placeholder="e.g., machine learning"
                                    />
                                    <button
                                        onClick={handleExplainConcept}
                                        disabled={!isReady || aiLoading || !conceptText.trim()}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Explain
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DocumentDetailPage;