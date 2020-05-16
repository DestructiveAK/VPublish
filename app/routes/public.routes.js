const { checkUser } = require('../middlewares/auth');
const Paper = require('../models/paper.model');
const router = require('express').Router();

//getting home page
router.get('/', function (req, res) {
    res.render('home')
});


//routes for author

router.get('/login', function (req, res) {
    if (req.session.user && req.session.user.role === 'author' && req.cookies.user_logged) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        urlLogin: '/login',
        signUp: true,
        urlForgot: '/forgot'
    });
});

router.get('/signup', function (req, res) {
    if (req.session.user && req.session.user.role === 'author' && req.cookies.user_logged) {
        return res.redirect('/dashboard');
    }
    res.render('signup', {
        urlSignUp: '/signup',
        urlLogin: '/login'
    });
});

router.get('/dashboard', checkUser, function (req, res) {
    if (req.session.user.role !== 'author') return res.redirect('/login');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    Paper.find({authorId: req.session.user.email}, (err, papers) => {
        if (papers.length === 0) return res.render('dashboard');
        res.render('dashboard', {
            papers: papers
        });
    });
});


//Temporary routes for admin
router.get('/admin', function (req, res) {
    res.render('forbidden');
});


//routes for reviewer

router.get('/reviewer/signup', (req, res) => {
    if (req.session.user && req.session.user.role === 'reviewer' && req.cookies.user_logged) {
        return res.redirect('/reviewer/dashboard');
    }
    res.render('signup', {
        urlSignUp: '/reviewer/signup',
        urlLogin: '/reviewer/login'
    });
});

router.get('/reviewer/login', (req, res) => {
    if (req.session.user && req.session.user.role === 'reviewer' && req.cookies.user_logged) {
        return res.redirect('/reviewer/dashboard');
    }
    res.render('login', {
        urlLogin: '/reviewer/login',
        signUp: false,
        urlForgot: '/reviewer/forgot'
    });
});

router.get('/reviewer/dashboard', checkUser, (req, res) => {
    if (req.session.user.role !== 'reviewer') return res.redirect('/reviewer/login')
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    Paper.find({}, (err, papers) => {
        if (papers.length === 0) return res.render('dashboard');
        res.render('dashboard', {
            papers: papers
        });
    });
});


module.exports = router;    
