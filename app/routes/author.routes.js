const Author = require('../models/author.model');
const controller = require('../controllers/user.controller')
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

module.exports = router;
