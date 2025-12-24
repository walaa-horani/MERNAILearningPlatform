import express from "express"
import { body } from "express-validator"
import { changePassword, getProfile, login, register, updateProfile } from "../controllers/authControllers.js"
import authMiddleware from "../middlerware/auth.js"

const router = express.Router()


/* =========================
   Validation Middleware
========================= */



const registerValidation = [
    body("username")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters"),

    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
]

const loginValidation = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),
]


/* =========================
   Public Routes
========================= */


router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)



/* =========================
   Protected Routes
========================= */

router.get("/profile", authMiddleware, getProfile)
router.put("/profile", authMiddleware, updateProfile)
router.post("/change-password", authMiddleware, changePassword)


export default router



