const { restaurantSchema, reviewSchema } = require('./schemas.js');  //we have used joi here for server side validation
//const { reviewSchema } = require('./schemas.js');  //we have used joi here for server side validation
const Restaurant = require('./models/restaurant');    //yeh Restaurant model ka naam hai ab kyunki wahan se model export hua tha
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req,res,next) => {
    
//since we will have to add it to every route we have moved req.user to a middleware so that we can its access in every routes
//req.user method is automatically added to req object due to passport.. this then deserializes and gets the information of user whether anyone is logged in or not    
//console.log(req.user);   undefined- when no one is logged in and when someone is logged in it gives us the detail of that user 
//isauthenticated gets automatically added to when we require passport
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be logged in first');
        res.redirect('/login');
    }
    else{
        next();
    }
}

//If authentication succeeds, the next handler will be invoked and the req.user property will be set to the authenticated user.



module.exports.validateRestaurant = (req,res,next) => {
    
    // const result = restaurantSchema.validate(req.body);    it will first look for restaurant object and then it will check all other validations
    // console.log(result);  it will display the value passed and also if any error is there and if there is any error we need to throw it and stop it from getting saved to database
    
    const { error } = restaurantSchema.validate(req.body);  //destructuring also we have imported restaurantSchema from schema.js
    
    // if(result.error)  after destructuring only error we are passing
    if(error){       //if there is error
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');       //since our error.details is an object so we need to map it and get its message and if it is more than one object so we need to join those message also
        throw new ExpressError(msg, 400)   //it will then throw an error
    }
    else {
        next(); //it will call the next handler that is (req,res) of that particular route
    }
}

//isAuthor middleware
module.exports.isAuthor = async(req,res,next) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/restaurants/${restaurant._id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req,res,next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/restaurants/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){       //if there is error
        // console.log(error);
        const msg = error.details.map(el => el.message).join(',');       //since our error.details is an object so we need to map it and get its message and if it is more than one object so we need to join those message also
        throw new ExpressError(msg, 400)   //it will then throw an error
    }
    else {
        next(); //it will call the next handler that is (req,res) of that particular route
    }
}