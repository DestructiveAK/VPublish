const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
        firstname: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 30
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            default: 'admin'
        }
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Admin', AdminSchema);
