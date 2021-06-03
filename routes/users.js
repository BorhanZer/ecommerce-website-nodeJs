var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
const { body, check, validationResult } = require('express-validator');

// Get user model
var User = require('../modeles/user');
/*
 *  Get register
 */
router.get('/register', function(req, res) {

    res.render('register', {
        title: 'Register'
    });
});
/*
 *  Post register
 */
router.post('/register', async function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    await check('name', 'Name is required!').notEmpty().run(req);
    await check('email', 'Email is required!').notEmpty().run(req);
    await check('username', 'Username is required!').notEmpty().run(req);
    await check('password', 'Password is required!').notEmpty().run(req);
    await check('password2', 'password do not match!.').notEmpty().equals(password).run(req);


    const validationResults = validationResult(req);

    if (validationResults.isEmpty()) {
        User.findOne({ username: username }, function(err, user) {
            if (err) {
                console.log(err);
            }
            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, hash) {
                        if (err) {
                            console.log(err);
                        }
                        user.password = hash;
                        user.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'you are now registered!');
                                res.redirect('/users/login');
                            }
                        });
                    });
                });
            }
        });
    } else {
        var errors = validationResults.array({ onlyFirstError: true });
        res.render('register', {
            title: 'Register',
            errors: errors
        });

    }
});
/*
 *  Get login
 */
router.get('/login', function(req, res) {
    if (res.locals.user) {
        res.redirect('/');
    }
    res.render('login', {
        title: 'Log in'
    });
});
/*
 *  Post login
 */
router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
});

// get log out
/*
 *  Get login
 */
router.get('/logout', function(req, res) {
    req.logOut();
    req.flash('success', 'You are logged out!');
    res.redirect('/');
});
// Exports
module.exports = router;