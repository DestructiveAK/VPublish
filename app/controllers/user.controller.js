const User = require('../models/user.model.js');
const Token = require('../models/token.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//Create and save a new user
exports.signup = (req, res) => {
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const passwordRepeat = req.body.passwordrepeat;

    if (!firstName || !email || !password || !passwordRepeat) return res.status(400).send({
        msg: 'Form incomplete'
    });
    User.findOne({email: email}, function (err, user) {
        if (user) return res.render('../public/signup',
            {error: 'Email is already associated with another account.'});

        if (password !== passwordRepeat) return res.render('../public/signup',
            {error: 'Confirm Password is not matching Password'});

        const newUser = new User({
            firstname: firstName,
            lastname: lastName,
            email: email,
            password: bcrypt.hashSync(password, 10)
        });
        newUser.save(function (err) {
            if (err) return res.render('../public/signup', {error: err});
        });

        // Create a verification token for this user
        const token = new Token({_userId: newUser._id, token: crypto.randomBytes(16).toString('hex')});

        // Save the verification token
        token.save(function (err) {
            if (err) {
                return res.status(500).send({msg: err.message});
            }
            require('../mail/confirmation.mail')(newUser, req, token);
            res.send({msg: 'User account created successfully.'});
        });
    });
};


exports.login = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email && !password) {
        return res.status(400).send({
            msg: 'No data received'
        });
    }

    User.findOne({email: email}, function (err, user) {
        if (!user) return res.render('../public/login', {error: 'User not found.'});
        if (!bcrypt.compareSync(password, user.password))
            return res.render('../public/login',{error: 'Invalid Email or Password.'});
        if (!user.isVerified)
            return res.render('../public/login', {error: 'User not verified.'});
        req.session.user = user;
        res.redirect('/dashboard');
    });
};


exports.logout = (req, res) => {
    if (req.session.user && req.cookies.user_logged) {
        req.session.destroy(() => {
            res.clearCookie('user_logged');
            res.redirect('/');
        });
    } else {
        res.redirect('/login');
    }
};
