const Restaurant = require('../models/restaurant');    //yeh Restaurant model ka naam hai ab kyunki wahan se model export hua tha
const Review = require('../models/review');


module.exports.createReview = async (req,res) => {
    // res.send(req.body.review);
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;     //if we make it tell here then there is a logged in user and we are storing who is the owner of that review 
    restaurant.reviews.push(review);      //one to many relation ....one restaurant can have many reviews so we store it in array ....this is the reason we use push
    await review.save();
    await restaurant.save();
    req.flash('success', 'Created new review');
    res.redirect(`/restaurants/${id}`);
}

module.exports.deleteReview = async (req,res) => {
    const {id, reviewId} = req.params;
    await Restaurant.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});     //since we are deleting the review, so we also need to remove the reference from reviews array in restaurant schema 
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Sucessfully deleted review');
    res.redirect(`/restaurants/${id}`);
}