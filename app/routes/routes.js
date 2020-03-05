const path = require('path');

module.exports = (app) => {

    //getting home page
    app.get('/', function (req, res) {
        res.sendFile(path.resolve('public/home.html'));
    });

    //getting login page
    app.get('/login', function (req, res) {
        res.sendFile(path.resolve('public/login.html'));
    });

    //getting user sign up page
    app.get('/signup', function (req, res) {
        res.sendFile(path.resolve('public/signup.html'));
    });

    //getting dashboard page for each user
    app.get('/dashboard', function (req, res) {
        res.sendFile(path.resolve('public/dashboard.html'));
    });

    //getting new_submission page for submitting new paper
    app.get('/create', function (req, res) {
        res.sendFile(path.resolve('public/new_submission.html'));
    });
};
