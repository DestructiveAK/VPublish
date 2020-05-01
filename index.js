const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const secret = require('./config/secret.config');
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const app = express();
const path = require('path');


//define listening port
const PORT = 8080;


const eventLoopStats = require('event-loop-stats');
console.log('Stats', eventLoopStats.sense());

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log("Could not connect to the database: ", err);
    process.exit();
});


//request-response logs
app.use(morgan('dev'));

app.use(require('express-status-monitor')());

//parsing requests
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());


//create session for user login
app.use(session({
    store: new MongoStore({
        url: dbConfig.URL
    }),
    secret: secret.SECRET,
    key: secret.KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 86400000
    }
}));

//clear cookies from client if there is no user session stored on server
app.use((req, res, next) => {
   if (req.cookies.user_logged && !req.session.user) {
       res.clearCookie('user_logged');
       next();
   } else {
       next();
   }
});


app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views')



app.use(express.static(path.join(__dirname + '/public')));



//if user logged in set local variable user for rendering
app.use(function (req, res, next) {
    if (req.session.user && req.cookies.user_logged) {
        res.locals.user = req.session.user;
    }
    next();
})


//include public routes
require('./app/routes/routes')(app);

//include user routes
require('./app/routes/user.routes')(app);

//include paper routes
require('./app/routes/paper.routes') (app, mongoose);

// route for handling 404 requests(unavailable routes)
app.use(function (req, res) {
    res.status(404).render('not-found')
});

//Listen for call on port PORT
app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
});
