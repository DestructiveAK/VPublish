//importing express for building express app
const express = require('express');

//import express session for user authentication
const session = require('express-session');

//import cookie parser for parsing cookie
const cookieParser = require('cookie-parser');

//import morgan to log info about requests
const morgan = require('morgan');

const secret = require('./config/secret.config');

//define listening port
const PORT = 8080;

//configure database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

const MongoStore = require('connect-mongo')(session);


//create app
const app = express();

const path = require('path');

//import multer for parsing multipart/form-data
const multer = require('multer');
const upload = multer();


app.use(morgan('dev'));

mongoose.Promise = global.Promise;

//Connecting to database
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



//parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

//parse requests of content-type - application/json
app.use(express.json());

//parse requests of content-type - mutipart/form-data
app.use(upload.array());

app.use(cookieParser());

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

app.use((req, res, next) => {
   if (req.cookies.user_logged && !req.session.user) {
       res.clearCookie(key);
   } else {
       next();
   }
});

app.set('view engine', 'pug');


//defining static contents html, css, js, etc.
app.use(express.static(path.join(__dirname + '/public')));

//include public routes
require('./app/routes/routes')(app);

//include user routes
require('./app/routes/user.routes')(app);

// route for handling 404 requests(unavailable routes)
app.use(function (req, res) {
    res.render(path.resolve('public/not-found'))
});

//Listen for call on port PORT
app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
});
