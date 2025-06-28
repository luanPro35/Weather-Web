/**
 * Middleware Configuration
 * 
 * This file defines middleware functions used throughout the application.
 */

const express = require('express');
const path = require('path');

module.exports = function(app) {
    // Body parser middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Serve static files
    app.use(express.static('public'));
    
    // Add CORS headers for API requests
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            return res.status(200).json({});
        }
        next();
    });
};