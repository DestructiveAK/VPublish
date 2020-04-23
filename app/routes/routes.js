const Token = require('../models/token.model');
const User = require('../models/user.model');
const { checkUser } = require('../middlewares/auth');

module.exports = (app) => {

    //getting home page
    app.get('/', function (req, res) {
        res.render('home')
    });

    //getting login page
    app.get('/login', function (req, res) {
        if (req.session.user && req.cookies.user_logged) {
            return res.redirect('/dashboard');
        }
        res.render('login');
    });

    //getting user sign up page
    app.get('/signup', function (req, res) {
        if (req.session.user && req.cookies.user_logged) {
            return res.redirect('/dashboard');
        }
        res.render('signup');
    });

    //getting dashboard page for each user
    app.get('/dashboard', checkUser, function (req, res) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('dashboard');
    });

    //getting new_submission page for submitting new paper
    app.get('/create', checkUser, function (req, res) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('create');
    });

    //route for token verification for account confirmation
    app.get('/confirmation/:token', function (req, res) {
        if (!req.params) return res.status(400).send({msg: 'No data received.'});

        // Find a matching token
        Token.findOne({token: req.params.token}, function (err, token) {
            if (!token) return res.render('success', {
                msg: 'Unable to verify',
                info: 'Link expired',
                page: 'home',
                stat: 'failed'
            });
            // If found a token, find a matching user
            User.findOne({_id: token._userId})
                .then(user => {
                    if (!user) return res.render('success',{
                        msg: 'Unable to verify',
                        info: 'Account does not exist',
                        page: 'home',
                        stat: 'failed'
                    });
                    if (user.isVerified) return res.render('success',{
                        msg: 'Account already verified.',
                        info: 'This account is already verified',
                        page: 'login',
                        stat: 'success'
                    });

                    // Verify and save the user
                    user.isVerified = true;
                    user.save();
                    return res.render('success', {
                        msg: 'Account verified',
                        page: 'login',
                        stat: 'success',
                        info: 'Account has been successfully verified'
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        });
    });
};
