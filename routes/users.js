const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
// require users controller
const users = require('../controllers/users')


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))


router.route('/login')
    .get(users.renderLogin)
    // passport middleware handles the authentication and options can show flash and redirect - inlcudes a .login() function 
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

// req.logout is a passport method that clears req.user and requires a callback 
router.get('/logout', users.logout)

module.exports = router;