const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync'); 
//restaurant controller - restaurants is an object which consists of all controllers you can access them by restaurants.controller_name
const restaurants = require('../controllers/restaurants');

const {isLoggedIn, validateRestaurant, isAuthor } = require('../middleware');
const Restaurant = require('../models/restaurant');    //yeh Restaurant model ka naam hai ab kyunki wahan se model export hua tha

//Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
const multer  = require('multer');  //to upload files this middleware is needed

const {storage} = require('../cloudinary');  //it will automatically search for index file

//upload.single('image') -> looks for the image field which will come from the form...the image will be then added to req.file and rest of the body to req.body 
//upload.array('image') -> multiple images uploaded in the image field will be added to req.files and rest of the body to req.body

//here we will use storage(it consists of an object) to store our files which we exported 
const upload = multer({ storage });   //const upload = multer({ dest: 'uploads/' })  ...we need to specify location where we need to store our files basically cloudinary or aws ...and if we dont specify then it will store in local storage
//dest: 'uploads/' will create a separate folder where all our files are stored but here we are passing cloudinary storage
router.get('/', catchAsync(restaurants.index));

router.get('/new', isLoggedIn, restaurants.renderNewForm)


// we are using a catchAsync function for catching errors caused by async functions
// but we can also use try - catch method
// try{
//     things you want to execute...
// }catch(err){
//     next(err);  this next will help us move to the next error handler ,if we had only next() then it will move to  the next non error handler but since we are catching error and passing it to next(err) so it will move to the next error handler
// }  both the method performs same but we are passing it to catchAsync function so that we dont need to write try catch several times

// upload.array('image')..since we have mentioned {storage} so it will upload the image to the cloudinary loaction and then return details to req.files .... due to this multer middleware we will have req.body and req.files(it consists of several fields ...in which we need path -> url of image and filename-> where our file is stored)

// upload.array('image') due to this multer middleware we will have req.body and req.files(it consists of several fields ...in which we need path -> url of image and filename-> where our file is stored)
router.post('/', isLoggedIn, upload.array('image'), validateRestaurant, catchAsync(restaurants.createCampground));
// router.post('/', upload.array('image'), (req,res) => {
//     console.log(req.body, req.files);
//     res.send("IT worked");
// });


router.get('/:id', catchAsync(restaurants.showRestaurant));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(restaurants.renderEditForm));

//first we are uploading so that we get the req.body and req.file and then validate
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateRestaurant, catchAsync(restaurants.updateRestaurant));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(restaurants.deleteRestaurant));

module.exports = router;