const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    logoutUser 
} = require('../controllers/user.controller');
const { verifyAccessToken } = require('../middleware/auth.middleware');

// Define routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', verifyAccessToken, logoutUser);

module.exports = router;