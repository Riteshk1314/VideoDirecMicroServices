// config/auth.config.js
const authConfig = {
    accessTokenExpiry: '15m',  // Short-lived
    refreshTokenExpiry: '7d',  // Longer-lived
    accessTokenSecret: "ACCESS_TOKEN_SECRET",
    refreshTokenSecret: "REFRESH_TOKEN_SECRET" 
};