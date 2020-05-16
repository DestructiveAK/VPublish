const Reviewer = require('../models/reviewer.model');
const controller = require('../controllers/user.controller')
const router = require('express').Router();

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


module.exports = router;
