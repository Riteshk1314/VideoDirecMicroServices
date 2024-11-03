const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const authConfig = require("../config/auth.config");


const verifyAccessToken = asyncHandler(async (req, res, next) => {
    // Debug: Check if access token is in cookies or header
    console.log("Cookies:", req.cookies);
    console.log("Authorization Header:", req.header("Authorization"));

    // Attempt to retrieve access token from cookie or Authorization header
    const accessToken = req.cookies?.accessToken || 
        (req.header("Authorization")?.startsWith("Bearer ") ? 
        req.header("Authorization").split(" ")[1] : null);

    if (!accessToken) {
        console.log("No access token found."); // Debugging output
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(accessToken, authConfig.accessTokenSecret);
        const user = await User.findById(decodedToken.id).select("-password -refreshToken");

        if (!user) {
            console.log("User not found with provided token."); // Debugging output
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Token verification error:", error.message); // Debugging output
        throw new ApiError(
            401,
            error.message === "jwt expired" ? "Access token expired" : "Invalid Access Token"
        );
    }
});



const verifyRefreshToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, authConfig.refreshTokenSecret);
        const user = await User.findById(decodedToken.id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message === "jwt expired" ? 
            "Refresh token expired" : "Invalid Refresh Token");
    }
});
module.exports = { verifyAccessToken, verifyRefreshToken };