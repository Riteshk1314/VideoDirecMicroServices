const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model.js');
// Import the User model


const asyncHandler =require("../utils/asyncHandler.js");
const ApiError =require("../utils/apiError.js");
const ApiResponse = require("../utils/apiResponse.js");
// const { DEFAULT } = require('@react-three/fiber/dist/declarations/src/core/utils.js');
const { sendUserEvent } = require('../services/kafka.service.js');
const authConfig = require('../config/auth.config.js');
const mongoose = require('mongoose');

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found for token generation");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generateTokens:", error);  // Log the error
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const user = await User.create({
        email,
        password,
        name: name.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


const loginUser = asyncHandler(async (req, res) => {
const { email, password } = req.body;

if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
}

const user = await User.findOne({ email });

if (!user) {
    throw new ApiError(404, "User not found");
}

const isPasswordValid = await user.comparePassword(password);

if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
}

// Generate both tokens
const { accessToken, refreshToken } = await generateTokens(user._id);

// Save refresh token in database
user.refreshToken = refreshToken;
await user.save();

const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

// Cookie options
const accessTokenOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict'
};

const refreshTokenOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict'
};
await sendUserEvent('USER_LOGIN', {
    id: user._id.toString(),
    email: user.email,
    timestamp: new Date().toISOString()
  });
return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in Successfully"
        )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token required");
}

try {
    // Verify refresh token
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        authConfig.refreshTokenSecret
    );

    // Find user with this refresh token
    const user = await User.findById(decodedToken.id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    // Verify if incoming refresh token matches stored refresh token
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token expired or used");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Cookie options
    const accessTokenOptions = {
        expires: new Date(Date.now() + 15 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
    };

    const refreshTokenOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed"
            )
        );
} catch (error) {
    throw new ApiError(401, "Invalid refresh token");
}
});

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find user and remove refresh token
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { refreshToken: null } },
        { new: true } // This option returns the modified document
    );

    // Check if the user was found and updated
    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    // Clear cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    // Optionally, log out event to Kafka or other service
    try {
        await sendUserEvent("USER_LOGOUT", {
            id: userId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to send logout event", error);
    }

    // Send success response
    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});


module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };