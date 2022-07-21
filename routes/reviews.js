const express = require('express');
const router = express.Router({mergeParams: true});  //this is because we have added aour :id in app.js so we dont have access to it here therefore we are merging params 

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync'); 
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Restaurant = require('../models/restaurant');    //yeh Restaurant model ka naam hai ab kyunki wahan se model export hua tha
const Review = require('../models/review');


//reviews
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;