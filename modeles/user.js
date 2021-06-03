var mongoose = require('mongoose');

// User Schema

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    admin: {
        type: Number
    }
});

var user = module.exports = mongoose.model('User', UserSchema);