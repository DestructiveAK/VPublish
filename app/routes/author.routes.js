const Author = require('../models/author.model');
const Paper = require('../models/paper.model');
const controller = require('../controllers/user.controller');
const router = require('express').Router();

//Create new user account
router.post('/signup', controller.signup(Author));


router.post('/login', controller.login(Author));

//Logout
router.get('/logout', controller.logout());


router.post('/forgot', controller.forgot(Author));

//route for token verification for account confirmation
router.get('/confirmation/:token', controller.confirmation(Author));

router.get('/reset/:token', controller.resetGet());

router.post('/reset/:token', controller.resetPost(Author));

router.get('/profile', async (req, res) => {
    if (!req.session.user) return res.render('forbidden');
    const paper = {};
    try {
        paper.submitted = await Paper.countDocuments({authorId: req.session.user.email, status: 'Submitted'});
        paper.underReview = await Paper.countDocuments({authorId: req.session.user.email, status: 'Under Review'});
        paper.needsRevision = await Paper.countDocuments({authorId: req.session.user.email, status: 'Needs Revision'});
        paper.accepted = await Paper.countDocuments({authorId: req.session.user.email, status: 'Accepted'});
        paper.rejected = await Paper.countDocuments({authorId: req.session.user.email, status: 'Rejected'});
        res.render('profile', {
            paper: paper
        });
    } catch (e) {
        res.render('not-found');
        console.error(e);
    }
});

router.post('/change/details', controller.changeDetails(Author));

router.post('/change/password', controller.changePassword(Author));

module.exports = router;
