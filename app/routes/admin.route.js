const Admin = require('../models/admin.model');
const Author = require('../models/author.model');
const Reviewer = require('../models/reviewer.model');
const Paper = require('../models/paper.model');
const router = require('express').Router();
const controller = require('../controllers/user.controller');
const {checkUser} = require('../helpers/auth');


router.post('/login', controller.login(Admin));

router.post('/logout', controller.logout());

router.get('/login', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin' && req.cookies.user_logged) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        signUpLink: false,
        forgotLink: false
    });
})

router.get('/dashboard', checkUser, async (req, res) => {
    return res.render('forbidden');
    if (req.session.user.role !== 'admin') return res.redirect('/');
    let author, reviewer, paper;
    try {
        author = await Author.find({});
        reviewer = await Reviewer.find({});
        paper = await Paper.find({});
    } catch (e) {
        console.error(e);
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render('dashboard_admin', {
        author: author,
        reviewer: reviewer,
        paper: paper
    });
})


module.exports = router;
