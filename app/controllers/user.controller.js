const User = require('../models/user.model.js');

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
    if (password === passwordRepeat) {
        const user = new User({
            firstname: firstName,
            lastname: lastName,
            email: email,
            password: password
        });
        user.save()
            .then(() => {
                res.redirect('/login');
            }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred"
            });
        })
    }

};



exports.findOne = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "No data received"
        });
    }
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email}).then(function (user) {
        if(!user) {
            res.redirect('/login');
        } else if(user.password !== password) {
            res.redirect('/login');
        } else {
            res.redirect('/dashboard');
        }
    });
};
