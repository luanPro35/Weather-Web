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
        sessionSecret: 'weather-web-secret',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
    
    // Weather API settings
    weather: {
        apiKey: process.env.WEATHER_API_KEY || 'your-openweathermap-api-key',
        baseUrl: 'https://api.openweathermap.org/data/2.5'
    }
};