
const Token = require('../models/token.model');
const bcrypt = require('bcryptjs');
const {generateToken} = require('../helpers/token');

exports.signup = (User) => {
    return (req, res) => {
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
    }
}

exports.login = (User) => {
    return (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).send({
                msg: 'No data received'
            });
        }

        User.findOne({email: email}, function (err, user) {
            if (!user) return res.render('login', {
                error: 'Invalid Email or Password.',
                forgotLink: true,
                signUpLink: true
            });
            if (!bcrypt.compareSync(password, user.password))
                return res.render('login', {
                    error: 'Invalid Email or Password.',
                    forgotLink: true,
                    signUpLink: true
                });
            if (!user.isVerified)
                return res.render('login', {error: 'User not verified.'});
            req.session.user = {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            };
            res.redirect('dashboard');
        });
    }
}

exports.logout = () => {
    return (req, res) => {
    if (req.session.user && req.cookies.user_logged) {
        req.session.destroy(() => {
            res.clearCookie('user_logged');
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
}
}

exports.forgot = (User) => {
    return (req, res) => {
        const email = req.body.email;
        if (!email) return res.send({error: 'No email provided'});
        User.findOne({email: email}, (err, user) => {
            if (!user) return res.end();
            const token = generateToken(user);
            if (!token) return res.end();
            require('../mail/forgot.mail')(user, req, token);
        });
        res.end();
    }
}

exports.confirmation = (User) => {
    return (req, res) => {
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
    }
}

exports.resetGet = () => {
    return (req, res) => {
        if (!req.params.token) return res.render('forbidden');
        Token.findOne({token: req.params.token})
            .then(token => {
                if (!token) return res.render('forbidden');
                res.render('reset');
            })
            .catch(e => {
                console.error(e);
            });
    }
}

exports.resetPost = (User) => {
    return (req, res) => {
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
    }
}

exports.changeDetails = (User) => {
    return (req, res) => {
        if (!req.session.user) return res.render('forbidden');
        const firstName = req.body.firstname;
        const lastName = req.body.lastname;
        const email = req.body.email;
        if (!firstName || !lastName || !email) return res.render('forbidden');
        User.findOne({email: req.session.user.email})
            .then(user => {
                user.firstname = firstName;
                user.lastname = lastName;
                user.email = email;
                user.save();
                req.session.user = {
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                    role: user.role
                };
                req.session.save();
            }).catch(err => {
            console.error(err);
        })
        res.redirect('back');
    }
}

exports.changePassword = (User) => {
    return (req, res) => {
        if (!req.session.user) return res.render('forbidden');
        const currentPassword = req.body.current_password;
        const newPassword = req.body.new_password;
        const confirmPassword = req.body.confirm_password;
        if (!confirmPassword || !newPassword || !currentPassword) return res.status(400).send('Incomplete data provided');
        if (newPassword !== confirmPassword) return res.status(400).send('Invalid data');
        User.findOne({email: req.session.user.email})
            .then(user => {
                if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(400).send('Invalid password');
                user.password = bcrypt.hashSync(newPassword, 10);
                user.save();
                res.status(200).send('Password Change');
            }).catch(err => {
            console.error(err);
        });
    }
}

exports.profileImage = (User) => {
    return (req, res) => {
        if (!req.session.user) return res.render('forbidden');
        if (!req.file) return res.redirect('back');
        User.findOne({email: req.session.user.email})
            .then(user => {
                user.profileImage = req.file;
                user.save();
            }).catch(e => {
            console.error(e);
        });
        res.redirect('back');
    }
}


exports.deleteAccount = (User) => {
    return (req, res) => {
        if (req.session.user.role !== 'admin') res.sendStatus(400);
        const userId = req.params.id;
        User.deleteOne({_id: userId}, (err) => {
            console.log(err);
        });
        res.sendStatus(200);
    }
}
