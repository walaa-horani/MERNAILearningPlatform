import express from "express";

import upload from "../config/multer.js";
import authMiddleware from "../middlerware/auth.js";
import { deleteDocument, getDocument, getDocuments, updateDocument, uploadDocument } from "../controllers/documentsController.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Upload document
router.post("/upload", upload.single("file"), uploadDocument);

// Get all documents
router.get("/", getDocuments);

// Get single document
router.get("/:id", getDocument);

// Delete document
router.delete("/:id", deleteDocument);

// Update document
router.put("/:id", updateDocument);

export default router;
