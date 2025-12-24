import express from "express";
import {
    getDashboard,
} from "../controllers/progressController.js";
import authMiddleware from "../middlerware/auth.js";

const router = express.Router();

// Protect all routes below
router.use(authMiddleware);

// Routes
router.get("/dashboard", getDashboard);

export default router;
