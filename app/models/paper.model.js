const mongoose = require('mongoose');

const PaperSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    abstract: {
        type: String,
        required: true,
    },
    keywords: {
        type: String,
        required: true
    },
/*    userID : {
        type: mongoose.Schema.Types.ObjectID,
        required: true,
        ref: 'User'
    }*/
});

module.exports = mongoose.model('Paper', PaperSchema);
