const Editor = require('../models/editor.model');
const controller = require('../controllers/user.controller')
const router = require('express').Router();
const Paper = require('../models/paper.model');
const {checkUser} = require("../helpers/auth");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});


//Create new user account
router.post('/signup', controller.signup(Editor));


router.post('/login', controller.login(Editor));

//Logout
router.get('/logout', controller.logout());


router.post('/forgot', controller.forgot(Editor));

//route for token verification for account confirmation
router.get('/confirmation/:token', controller.confirmation(Editor));

router.get('/reset/:token', controller.resetGet());

router.post('/reset/:token', controller.resetPost(Editor));

router.get('/signup', (req, res) => {
    if (req.session.user && req.session.user.role === 'editor' && req.cookies.user_logged) {
        return res.redirect('dashboard');
    }
    res.render('signup');
});

router.get('/login', (req, res) => {
    if (req.session.user && req.session.user.role === 'editor' && req.cookies.user_logged) {
        return res.redirect('dashboard');
    }
    res.render('login', {
        signUpLink: false,
        forgotLink: true
    });
});

router.get('/dashboard', checkUser, (req, res) => {
    if (req.session.user.role !== 'editor') return res.redirect('/')
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    Paper.find({status: 'Reviewed'}, (err, papers) => {
        if (papers.length === 0) return res.render('dashboard');
        res.render('dashboard', {
            papers: papers
        });
    });
});


router.get('/profile', async (req, res) => {
    if (!req.session.user) return res.render('forbidden');
    const paper = {};
    try {
        const user = await Editor.findOne({email: req.session.user.email}, {profileImage: 1});
        const image = (user.profileImage) ? user.profileImage.buffer.toString('base64') : null;
        const mimeType = (user.profileImage) ? user.profileImage.mimetype : null;
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

router.post('/change/details', controller.changeDetails(Editor));

router.post('/change/password', controller.changePassword(Editor));

router.post('/change/image', upload.single('image'), controller.profileImage(Editor));

router.get('/delete/:id', controller.deleteAccount(Editor));

module.exports = router;
