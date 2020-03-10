//importing express for building express app
const express = require('express');

//import body-parser for parsing content-type - application/json and application/x-www.form-urlencoded
const bodyParser = require('body-parser');

//define listening port
const PORT = 8080;

const path = require('path');

//create app
const app = express();

const path = require('path');

//import multer for parsing multipart/form-data
const multer = require('multer');
const upload = multer();

//parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//parse requests of content-type - application/json
app.use(bodyParser.json());

//parse requests of content-type - mutipart/form-data
app.use(upload.array());

//configure database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//Connecting to database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log("Could not connect to the database: ", err);
    process.exit();
});

app.use(express.static(path.join(__dirname + '/public')));

//include public routes
require('./app/routes/routes')(app);

//include user routes
require('./app/routes/user.routes')(app);

//Listen for call on port PORT
app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
});
