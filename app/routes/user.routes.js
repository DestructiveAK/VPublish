//exporting for routes for use
module.exports = (app) => {
    //importing controllers for using specific functions
    const users = require('../controllers/user.controller.js');

    //Create new user account
    app.post('/signup', users.create);

    //Retrieve a user account
    app.post('/login', users.login);

};
