import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import cookieParser from "cookie-parser"
import compression from "compression"

import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import documentRoutes from "./routes/documentsRoutes.js"
import flashcardRoutes from "./routes/flashcardsRoutes.js"
import quizRoutes from "./routes/quizRoutes.js"
import errorHandler from "./middlerware/errorHandler.js"
import aiRoutes from "./routes/aiRoutes.js"
import progressRoutes from "./routes/progressRoutes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize express app
const app = express()

// Connect to MongoDB
connectDB()

// Compress all responses
app.use(compression())

// Middleware to handle CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

// Add the default regex for vercel preview URLs
allowedOrigins.push(/\.vercel\.app$/);

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            const isAllowed = allowedOrigins.some(allowed => {
                if (allowed instanceof RegExp) {
                    return allowed.test(origin);
                }
                return allowed === origin;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


// Routes
app.use("/auth", authRoutes)
app.use("/documents", documentRoutes)
app.use("/flashcards", flashcardRoutes)
app.use("/quizzes", quizRoutes)
app.use("/ai", aiRoutes)
app.use("/progress", progressRoutes)


// Static uploads (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(errorHandler)


// Start server
const PORT = process.env.PORT || 8000
app.get("/", (req, res) => {
    res.status(200).send("API Server is running");
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})






