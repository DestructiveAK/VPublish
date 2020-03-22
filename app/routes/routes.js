const Token = require('../models/token.model');
const User = require('../models/user.model');
const { checkUser } = require('../middlewares/auth');

module.exports = (app) => {

    //getting home page
    app.get('/', function (req, res) {
        res.render('../public/home')
    });

    //getting login page
    app.get('/login', function (req, res) {
        if (req.session.user && req.cookies.user_logged) {
            return res.redirect('/dashboard');
        }
        res.render('../public/login');
    });

    //getting user sign up page
    app.get('/signup', function (req, res) {
        if (req.session.user && req.cookies.user_logged) {
            return res.redirect('/dashboard');
        }
        res.render('../public/signup');
    });

    //getting dashboard page for each user
    app.get('/dashboard', checkUser, function (req, res) {
        res.render('../public/dashboard', {user: req.session.user});
    });

    //getting new_submission page for submitting new paper
    app.get('/create', checkUser, function (req, res) {
        res.render('../public/create');
    });

    //route for token verification for account confirmation
    app.get('/confirmation/:token', function (req, res) {
        if (!req.params) return res.status(400).send({msg: 'No data received.'});

        // Find a matching token
        Token.findOne({ token: req.params.token }, function (err, token) {
            if (!token) return res.status(400).send({ type: 'not-verified',
                msg: 'We were unable to find a valid token. Your token may have expired.'
            });

            // If found a token, find a matching user
            User.findOne({_id: token._userId})
                .then(user => {
                    if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
                    if (user.isVerified) return res.status(400).send({ type: 'already-verified',
                        msg: 'This user has already been verified.'
                    });

                    // Verify and save the user
                    user.isVerified = true;
                    user.save();
                    return res.status(200).send('The account has been verified. Please log in.')
                })
                .catch(err => {
                    res.status(500).send({msg: err.message})
                });
        });
    })
};
