const Token = require('../models/token.model');
const crypto = require('crypto');

const generateToken = (user) => {
    const token = new Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString('hex')});

    token.save(function (err) {
        if (err) {
            console.error(err);
        }
    });
    return token.token;
};

exports.generateToken = generateToken;
