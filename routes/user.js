const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');

router.get('/register', users.renderRegister)

router.post('/register',catchAsync(users.register))

router.get('/login', users.renderLogin)
//If authentication succeeds, the next handler will be invoked and the req.user property will be set to the authenticated user.
//we are using local strategy for login we can also use google aur twitter for that and if there is an failure it will flash a message and will redirect to login
//if it gets authenticated then it passes to (req,res)
//since username is unique it searches for username then compares the hashed password with the password we passed in form ...we also have acces to salt so that we can hash salt and input password and then compare it with hashed password

//in login route passport.authenticate() automatically revokes req.login()...but in register route we need to call it
router.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout)

module.exports = router;