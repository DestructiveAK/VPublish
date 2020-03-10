const User = require('../models/user.model.js');
const Token = require('../models/token.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//Create and save a new paper
exports.create = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "No data received"
        });
    }
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const passwordRepeat = req.body.passwordrepeat;
    User.findOne({email: email}, function (err, user) {
        if (user) return res.status(400).send({msg: 'Email is already associated with another account.'});

        if (password === passwordRepeat) {
            const user = new User({
                firstname: firstName,
                lastname: lastName,
                email: email,
                password: bcrypt.hashSync(password, 10)
            });
            user.save(function (err) {
                if (err) return res.status(500).send({msg: err.message});
            });

            // Create a verification token for this user
            const token = new Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

            // Save the verification token
            token.save(function (err) {
                if (err) {
                    return res.status(500).send({msg: err.message});
                }
                require('../mail/confirmation.mail')(user, req, token);
            });
        }
    });
};



exports.findOne = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "No data received"
        });
    }
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email} ,function (err, user) {
        if (!user) return res.status(401).send({msg: 'Account not found.'});
        if (user.password !== bcrypt.hashSync(password, 10))
            return res.status(401).send({msg: 'Invalid email or password'});
        if (!user.isVerified)
            return res.status(401).send({ type: 'not-verified', msg: 'Your account has not been verified.' });

    });
};
