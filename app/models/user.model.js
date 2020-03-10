//import mongoose for creating database schema
const mongoose = require('mongoose');

//creating database schema for storing user data
const UserSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength:1,
        maxlength:30
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type:Boolean,
        default: false
    }
});

//exporting user schema for use
module.exports = mongoose.model('User', UserSchema);

