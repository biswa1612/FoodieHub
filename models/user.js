const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
//it provides a field for username that will be unique and a password basically it will add the username which we provided and the salt also tha hashed password field
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);