/**
 * User Model
 * 
 * This file defines the User schema for MongoDB.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    favoriteCities: {
        type: String,
        default: '[]',
        get: function(data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                return [];
            }
        },
        set: function(data) {
            return JSON.stringify(data);
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);