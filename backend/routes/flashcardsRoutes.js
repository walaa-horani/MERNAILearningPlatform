import express from "express";

import authMiddleware from "../middlerware/auth.js";
import { deleteFlashcardSet, getAllFlashcardSets, getFlashcards, reviewFlashcard, toggleSetStar, toggleStarFlashcard } from "../controllers/flashcardsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllFlashcardSets);
router.get("/:documentId", getFlashcards);
router.put("/set/:id/star", toggleSetStar);
router.post("/:cardId/review", reviewFlashcard);
router.put("/:cardId/star", toggleStarFlashcard);
router.delete("/:id", deleteFlashcardSet);

export default router;
