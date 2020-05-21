const {checkUser} = require('../helpers/auth');
const Paper = require('../models/paper.model');
const router = require('express').Router();

//getting home page
router.get('/', function (req, res) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render('home');
});


//routes for author

router.get('/login', function (req, res) {
    if (req.session.user && req.session.user.role === 'author' && req.cookies.user_logged) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        signUpLink: true,
        forgotLink: true
    });
});

router.get('/signup', function (req, res) {
    if (req.session.user && req.session.user.role === 'author' && req.cookies.user_logged) {
        return res.redirect('/dashboard');
    }
    res.render('signup');
});

router.get('/dashboard', checkUser, function (req, res) {
    if (req.session.user.role !== 'author') return res.redirect('/');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    Paper.find({authorId: req.session.user.email}, (err, papers) => {
        if (papers.length === 0) return res.render('dashboard');
        res.render('dashboard', {
            papers: papers
        });
    });
});


module.exports = router;    
