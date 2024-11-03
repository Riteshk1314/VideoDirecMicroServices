// auth-service/index.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const router = express.Router();
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);
const {verifyAccessToken} = require('./middleware/auth.middleware.js');
const { initializeKafka } = require('./config/kafka.config');



// User Schema
const { registerUser, loginUser } = require('./controllers/user.controller.js');


const authRoutes = require('./routes/auth.routes.js');
app.use('/api/v1/auth', authRoutes);
mongoose.connect('mongodb+srv://rkapoorbe23:La1YcgqAGSHLK7XL@blumi.r2bw9.mongodb.net/?retryWrites=true&w=majority&appName=Blumi')


const startServer = async () => {
    try {
        await initializeKafka(); // Make sure this line is inside an async function
        const PORT = process.env.PORT || 3002;
        app.listen(PORT, () => {
            console.log(`Auth service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();