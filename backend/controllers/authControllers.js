import jwt from "jsonwebtoken"
import User from "../models/User.js"

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    })
}

const sendTokenResponse = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Always true for cross-origin cookies
        sameSite: "none", // Required for cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

}

/* =========================
   Register
========================= */
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Please provide all required fields" })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email" })
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
        })

        // Generate token
        const token = generateToken(user._id)
        sendTokenResponse(res, token)

        // Send response
        res.status(201).json({
            success: true,
            token, // Include token in response
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/* =========================
   Login
========================= */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" })
        }

        // Find user by email and include password field
        const user = await User.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password)

        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Generate token ← YOU FORGOT THIS!
        const token = generateToken(user._id)

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // Send JSON response ← YOU FORGOT THIS!
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token  // ← Token will appear in JSON
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/* =========================
   Logout
========================= */
export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        })

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/* =========================
   Get Profile (Protected)
========================= */

export const getProfile = async (req, res) => {
    res.json({
        success: true,
        user: req.user,
        username: req.user.username,
        email: req.user.email,


    })
}


/* =========================
   Update Profile (Protected)
========================= */
export const updateProfile = async (req, res) => {
    try {
        const { username, email, password } = req.body

        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        user.username = username || user.username
        user.email = email || user.email

        if (password) {
            return res.status(400).json({ error: "Cannot update password here. Use /change-password endpoint" })
        }

        const updatedUser = await user.save()

        res.json({
            success: true,
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
            },
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/* =========================
   Change Password (Protected)
========================= */

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body

        const user = await User.findById(req.user.id).select("+password")
        if (!user || !(await user.matchPassword(currentPassword))) {
            const error = new Error("Current password is incorrect")
            error.statusCode = 401
            throw error
        }

        user.password = newPassword
        await user.save()

        res.json({
            success: true,
            message: "Password updated successfully",
        })
    } catch (error) {
        next(error)
    }
}
