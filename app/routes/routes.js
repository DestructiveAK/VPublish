const { checkUser } = require('../middlewares/auth');
const Paper = require('../models/paper.model');

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
        Paper.find({authorId: req.session.user.email}, (err, papers) => {
            if (papers.length === 0) return res.render('dashboard');
            res.render('dashboard', {papers: papers});
        });
    });

    //getting new_submission page for submitting new paper
    app.get('/create', checkUser, function (req, res) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('create');
    });

    //Temporary routes for admin and reviewer
    app.get(['/admin', '/reviewer'], function (req, res) {
        res.render('forbidden');
    });
};
