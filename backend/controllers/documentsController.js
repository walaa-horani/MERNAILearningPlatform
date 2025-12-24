import Document from "../models/Document.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import Flashcard from "../models/Flashcards.js";
import Quiz from "../models/Quiz.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { title } = req.body;

        if (!title) {
            // Delete uploaded file if no title provided
            await fs.unlink(req.file.path);

            return res.status(400).json({
                success: false,
                error: "Please provide a document title",
                statusCode: 400,
            });
        }

        // Get absolute file path
        const absoluteFilePath = path.resolve(req.file.path);

        console.log("File uploaded:");
        console.log("- Original name:", req.file.originalname);
        console.log("- Stored filename:", req.file.filename);
        console.log("- Relative path:", req.file.path);
        console.log("- Absolute path:", absoluteFilePath);

        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: absoluteFilePath, // Store absolute path
            fileUrl: fileUrl,
            fileSize: req.file.size,
            status: "processing",
        });

        // Process PDF asynchronously
        processPDF(document._id, absoluteFilePath).catch(err => {
            console.error("PDF processing error:", err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully",
        });

    } catch (error) {
        // Clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        next(error);
    }
};

const processPDF = async (documentId, filePath) => {
    try {
        console.log("=== PROCESS PDF STARTED ===");
        console.log("Document ID:", documentId);
        console.log("File Path:", filePath);

        // Verify file exists
        try {
            const stats = await fs.stat(filePath);
            console.log("File found, size:", stats.size, "bytes");
        } catch (err) {
            console.error("FILE NOT FOUND:", filePath);
            throw new Error(`PDF file not found at path: ${filePath}`);
        }

        // Extract text from PDF
        let text = "";
        let chunks = [];

        try {
            const result = await extractTextFromPDF(filePath);
            text = result.text;
            console.log("Text extracted, length:", text.length, "characters");

            if (text && text.length > 0) {
                chunks = chunkText(text, 500, 50);
                console.log("Text chunked into", chunks.length, "chunks");
            } else {
                console.warn("No text extracted from PDF");
            }
        } catch (pdfError) {
            console.error("PDF TEXT EXTRACTION FAILED:", pdfError.message);
            console.error("Stack:", pdfError.stack);
            throw pdfError; // Re-throw to mark document as failed
        }

        // Update document with extracted data
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: "ready",
        });

        console.log("=== DOCUMENT PROCESSED SUCCESSFULLY ===");
    } catch (error) {
        console.error("=== PROCESS PDF ERROR ===");
        console.error("Error:", error.message);
        console.error("Stack:", error.stack);

        try {
            await Document.findByIdAndUpdate(documentId, {
                status: "failed",
                error: error.message,
            });
            console.log("Document status set to FAILED");
        } catch (updateError) {
            console.error("Failed to update document status:", updateError);
        }
    }
};

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id),
                },
            },
            {
                $lookup: {
                    from: "flashcards",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "flashcardSets",
                },
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "quizzes",
                },
            },
            {
                $addFields: {
                    flashcardCount: { $size: "$flashcardSets" },
                    quizCount: { $size: "$quizzes" },
                },
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
        });
    } catch (error) {
        next(error);
    }
};

export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404,
            });
        }

        const flashcardCount = await Flashcard.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        return res.status(200).json({
            success: true,
            data: documentData,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404,
            });
        }

        // Delete file from filesystem
        try {
            await fs.unlink(document.filePath);
            console.log("File deleted:", document.filePath);
        } catch (err) {
            console.error("Failed to delete file:", err.message);
            // Continue anyway - delete from DB
        }

        // Delete document from database
        await document.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const updateDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404,
            });
        }

        document.title = req.body.title;
        await document.save();

        return res.status(200).json({
            success: true,
            data: document,
            message: "Document updated successfully",
        });
    } catch (error) {
        next(error);
    }
};