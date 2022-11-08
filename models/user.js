// MONGOOSE USRE MODEL


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email:{
        type: String, 
        required: true,
        unique: true
    }
})

// adds on to schema username field, password field, a salt field, makes sure usernames are unique, and adds on some methods
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);