const Reviewer = require('../models/reviewer.model');
const controller = require('../controllers/user.controller')
const router = require('express').Router();
const Paper = require('../models/paper.model');
const {checkUser} = require("../helpers/auth");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});


//Create new user account
router.post('/signup', controller.signup(Reviewer));


router.post('/login', controller.login(Reviewer));

//Logout
router.get('/logout', controller.logout());


router.post('/forgot', controller.forgot(Reviewer));

//route for token verification for account confirmation
router.get('/confirmation/:token', controller.confirmation(Reviewer));

router.get('/reset/:token', controller.resetGet());

router.post('/reset/:token', controller.resetPost(Reviewer));

router.get('/signup', (req, res) => {
    if (req.session.user && req.session.user.role === 'reviewer' && req.cookies.user_logged) {
        return res.redirect('dashboard');
    }
    res.render('signup');
});

router.get('/login', (req, res) => {
    if (req.session.user && req.session.user.role === 'reviewer' && req.cookies.user_logged) {
        return res.redirect('dashboard');
    }
    res.render('login', {
        signUpLink: false,
        forgotLink: true
    });
});

router.get('/dashboard', checkUser, (req, res) => {
    if (req.session.user.role !== 'reviewer') return res.redirect('/')
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    Paper.find({}, (err, papers) => {
        if (papers.length === 0) return res.render('dashboard');
        res.render('dashboard', {
            papers: papers
        });
    });
});

router.get('/review/:paperId', (req, res) => {
    if (req.session.user.role !== 'reviewer') return res.render('forbidden');
    const paperId = req.params.paperId;
    Paper.findById(paperId)
        .then((paper) => {
            paper.status = 'Under Review';
            paper.reviewerName = req.session.user.firstname + ' ' + req.session.user.lastname;
            paper.reviewerId = req.session.user.reviewerId;
            paper.save();
        }).catch((err) => {
        console.error(err);
    });
    res.redirect('back');
});

router.get('/profile', async (req, res) => {
    if (!req.session.user) return res.render('forbidden');
    const paper = {};
    try {
        const user = await Reviewer.findOne({email: req.session.user.email}, {profileImage: 1});
        const image = (user.profileImage) ? user.profileImage.buffer.toString('base64') : null;
        const mimeType = (user.profileImage) ? user.profileImage.mimetype : null;
        paper.underReview = await Paper.countDocuments({reviewerId: req.session.user.email, status: 'Under Review'});
        paper.needsRevision = await Paper.countDocuments({
            reviewerId: req.session.user.email,
            status: 'Needs Revision'
        });
        paper.accepted = await Paper.countDocuments({reviewerId: req.session.user.email, status: 'Accepted'});
        paper.rejected = await Paper.countDocuments({reviewerId: req.session.user.email, status: 'Rejected'});
        res.render('profile', {
            paper: paper,
            image: image,
            mimeType: mimeType
        });
    } catch (e) {
        res.render('not-found');
        console.error(e);
    }
});

router.post('/change/details', controller.changeDetails(Reviewer));

router.post('/change/password', controller.changePassword(Reviewer));

router.post('/change/image', upload.single('image'), controller.profileImage(Reviewer));

router.get('/delete/:id', controller.deleteAccount(Reviewer));

module.exports = router;
