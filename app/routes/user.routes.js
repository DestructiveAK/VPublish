module.exports = (app) => {
    const User = require('../models/user.model');
    const Token = require('../models/token.model');
    const bcrypt = require('bcryptjs');
    const { generateToken } = require('../middlewares/token');

    //Create new user account
    app.post('/signup', (req, res) => {
        const firstName = req.body.firstname;
        const lastName = req.body.lastname;
        const email = req.body.email;
        const password = req.body.password;
        const passwordRepeat = req.body.passwordrepeat;

        if (!firstName || !email || !password || !passwordRepeat) return res.status(400).send({
            msg: 'Form incomplete'
        });
        User.findOne({email: email}, function (err, user) {
            if (user) return res.render('signup',
                {error: 'Email is already associated with another account.'});

            if (password !== passwordRepeat) return res.render('signup',
                {error: 'Confirm Password is not matching Password'});

            const newUser = new User({
                firstname: firstName,
                lastname: lastName,
                email: email,
                password: bcrypt.hashSync(password, 10)
            });
            newUser.save(function (err) {
                if (err) return res.render('signup', {error: err.message});
            });

            // Create a verification token for this user
            const token = generateToken(newUser);

            if (!token) {
                User.deleteOne({_id: newUser._id}, (err) => {
                    console.error(err);
                });
                return res.render('success', {
                    msg: 'Unable to create account',
                    page: 'home',
                    stat: 'failed',
                    info: 'We\'re facing a server issue. Please try again later.'
                });
            }

            require('../mail/confirmation.mail')(newUser, req, token);
            res.render('success',{
                msg:'Account created successfully',
                page:'home',
                stat: 'success',
                info: 'A verification email has been sent to your email.' +
                    '\nPlease check your email and verify your account'
            });
        });
    });


    app.post('/login', (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).send({
                msg: 'No data received'
            });
        }

        User.findOne({email: email}, function (err, user) {
            if (!user) return res.render('login', {error: 'Invalid Email or Password.'});
            if (!bcrypt.compareSync(password, user.password))
                return res.render('login',{error: 'Invalid Email or Password.'});
            if (!user.isVerified)
                return res.render('login', {error: 'User not verified.'});
            req.session.user = {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            };
            res.redirect('/dashboard');
        });
    });

    //Logout
    app.get('/logout', (req, res) => {
        if (req.session.user && req.cookies.user_logged) {
            req.session.destroy(() => {
                res.clearCookie('user_logged');
                res.redirect('/');
            });
        } else {
            res.redirect('/login');
        }
    });


    app.post('/forgot', (req, res) => {
        const email = req.body.email;
        if (!email) return res.send({error: 'No email provided'});
        User.findOne({email: email}, (err, user) => {
            if (!user) return res.end();
            const token = generateToken(user);
            if (!token) return res.end();
            require('../mail/forgot.mail')(user, req, token);
        });
        res.end();
    });

    //route for token verification for account confirmation
    app.get('/confirmation/:token', function (req, res) {
        if (!req.params.token) return res.status(400).send({msg: 'No data received.'});

        // Find a matching token
        Token.findOne({token: req.params.token}, (err, token) => {
            if (!token) return res.render('success', {
                msg: 'Unable to verify',
                info: 'Link does not exist or may be expired. To generate new link, login.',
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
                    console.error(err);
                });
        });
    });

    app.get('/reset/:token', (req, res) => {
        if (!req.params.token) return res.render('forbidden');
        Token.findOne({token: req.params.token})
            .then(token => {
                if (!token) return res.render('forbidden');
                res.render('reset');
            })
            .catch(e => {
                console.error(e);
            });
    });

    app.post('/reset/:token', (req, res) => {
        if (!req.params.token) return res.sendStatus(400);
        Token.findOne({token: req.params.token})
            .then(token => {
                if (!token) return res.sendStatus(400);
                User.findOne({_id: token._userId})
                    .then(user => {
                        Token.deleteOne({_id: token._id}, (err) => {
                            console.error(err);
                        });
                        if (!user) return res.sendStatus(400);
                        const password = req.body.password;
                        const passwordRepeat = req.body.passwordrepeat;
                        if (password !== passwordRepeat) return res.sendStatus(400);
                        user.password = bcrypt.hashSync(password, 10);
                        user.save();
                        res.sendStatus(200);
                    });
            });
    });
};
