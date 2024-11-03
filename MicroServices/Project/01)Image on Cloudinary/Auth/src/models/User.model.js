const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')){

    return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        "ACCESS_TOKEN_SECRET",
        { expiresIn: "15m" }  // Adjust expiration as needed
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        "REFRESH_TOKEN_SECRET",
        { expiresIn: "7d" }  // Adjust expiration as needed
    );
};

const User = mongoose.model('User', userSchema);
module.exports = mongoose.model('User', userSchema); // Correct
