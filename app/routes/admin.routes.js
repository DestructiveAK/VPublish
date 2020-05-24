const Admin = require('../models/admin.model');
const Author = require('../models/author.model');
const Reviewer = require('../models/reviewer.model');
const Editor = require('../models/editor.model');
const Paper = require('../models/paper.model');
const router = require('express').Router();
const controller = require('../controllers/user.controller');
const {checkUser} = require('../helpers/auth');


router.post('/login', controller.login(Admin));

router.get('/logout', controller.logout());

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
    if (req.session.user.role !== 'admin') return res.redirect('/');
    try {
        let authors = await Author.find({}, {password: 0, profileImage: 0});
        let reviewers = await Reviewer.find({}, {password: 0, profileImage: 0});
        let editors = await Editor.find({}, {password: 0, profileImage: 0});
        let papers = await Paper.find({}, {_id: 1, title: 1, authorName: 1, reviewerName: 1, status: 1});
        if (authors.length === 0) authors = null;
        if (reviewers.length === 0) reviewers = null;
        if (editors.length === 0) editors = null;
        if (papers.length === 0) papers = null;
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('dashboard_admin', {
            authors: authors,
            reviewers: reviewers,
            editors: editors,
            papers: papers
        });
    } catch (e) {
        console.error(e);
        res.render('not-found');
    }
});


router.get('/profile', async (req, res) => {
    if (!req.session.user) return res.render('forbidden');
    try {
        const user = await Admin.findOne({email: req.session.user.email}, {profileImage: 1});
        const image = (user.profileImage) ? user.profileImage.buffer.toString('base64') : null;
        const mimeType = (user.profileImage) ? user.profileImage.mimetype : null;
        res.render('profile', {
            image: image,
            mimeType: mimeType
        });
    } catch (e) {
        res.render('not-found');
        console.error(e);
    }
});


module.exports = router;
