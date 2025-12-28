import jwt from "jsonwebtoken"
import User from "../models/User.js"

const authMiddleware = async (req, res, next) => {
    let token = req.cookies?.token

    // Check Authorization header if cookie token is not found
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.id).select("-password")

        if (!user) {
            console.log("Auth Middleware: User not found in DB")
            return res.status(401).json({ error: "Not authorized, user not found" })
        }

        req.user = user
        next()
    } catch (error) {
        console.error("Auth Middleware: Error", error.message)
        return res.status(401).json({ error: "Not authorized, invalid token" })
    }
}

export default authMiddleware
