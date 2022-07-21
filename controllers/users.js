const User = require('../models/user');

module.exports.renderRegister = (req,res) => {
    res.render('users/register');
}

module.exports.register = async (req,res) => {
    //this entire function is passed to catchAsync but we also added separately try catch so that if any error is there then it is displayed on the register page itself 
    //the try catch function gets executed in catchAsync function and flashes the error message if any
    try{
        const {email, username, password} = req.body;
        //first we make an user object where we add only email and username
        const user = await new User({email, username});
        //now we will use register function in which we pass the user instance which has email and username(unique) and also password which will be then hashed during registration
        //register is a static method available in user model because of passport-local-mongoose
        //user.register will add the user into our collection, if it doesn't exist already 
        const registeredUser = await User.register(user, password);
        //after register we need to login ...in login route passport.authenticate() automatically revokes req.login()...but here we need to call it
        //in req.login() we pass our registered user also it needs a callback for err so we cant await it
        //now this passport.authenticate() and req.login() will add user details into our session till it expires
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'successfully registered');
            res.redirect('/restaurants');
        })
        
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
    
}

module.exports.renderLogin = (req,res) => {
    res.render('users/login');
}

module.exports.login = (req,res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/restaurants');
}

module.exports.logout = (req,res) => {
    //logout function gets added to req automatically due to passport
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/restaurants');
}