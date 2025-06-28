/**
 * Passport Configuration
 * 
 * This file configures Passport.js for authentication.
 * Supports both Google OAuth and local email/password authentication.
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models/sequelize');
const config = require('./index');

module.exports = function() {
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists by Google ID
            let user = await User.findOne({ where: { googleId: profile.id } });
            
            if (!user) {
                // Check if user exists with the same email
                const existingUser = await User.findOne({ where: { email: profile.emails[0].value } });
                
                if (existingUser) {
                    // Update existing user with Google ID
                    existingUser.googleId = profile.id;
                    existingUser.image = profile.photos[0].value || existingUser.image;
                    await existingUser.save();
                    return done(null, existingUser);
                }
                
                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value
                });
            }
            
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
    
    // Configure Local Strategy (email/password)
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            // Find user by email
            const user = await User.findOne({ where: { email } });
            
            // If user not found or password doesn't match
            if (!user || !(await user.comparePassword(password))) {
                return done(null, false, { message: 'Email hoặc mật khẩu không đúng' });
            }
            
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};