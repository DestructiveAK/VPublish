const { checkUser } = require('../middlewares/auth');

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
        res.render('dashboard');
    });

    //getting new_submission page for submitting new paper
    app.get('/create', checkUser, function (req, res) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('create');
    });
};
