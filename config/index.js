/**
 * Configuration File
 * 
 * This file loads environment variables and exports configuration used throughout the application.
 */

require('dotenv').config();

module.exports = {
    // Google OAuth configuration
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI
    },
    
    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '123456789',
        name: process.env.DB_NAME || 'weather'
    },
    
    // Application settings
    app: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development',
        sessionSecret: 'weather-web-secret'
    }
};