import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import cookieParser from "cookie-parser"

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

// Middleware to handle CORS
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})






