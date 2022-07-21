const Restaurant = require('../models/restaurant');    //yeh Restaurant model ka naam hai ab kyunki wahan se model export hua tha
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  //multiple services are there but we want geocoding
const mapBoxToken = process.env.MAPBOX_TOKEN;  // we need to pass it to access token
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); //geocoder now contains two methods we need that is forward and reverse geocoding

const { cloudinary } = require('../cloudinary');  //it has a method to delete from cloudinary


module.exports.index = async (req,res) => {
    const restaurants = await Restaurant.find({});   //sare restaurant find kar rahe
    res.render('restaurants/index', {restaurants});
}

module.exports.renderNewForm = (req,res) => {
    res.render('restaurants/new');
}

module.exports.createCampground = async (req,res,next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.restaurant.location,
        limit: 1
    }).send()    
    //basically by throwing error using expressError function we are setting which message we want to display
    // if(!req.body.restaurant) throw new ExpressError('Invalid Restaurant Data', 400);  catchAsync function catches this error which is then passed to next error handler
    //console.log(geoData.body.features[0].geometry.coordinates);
    const restaurant = new Restaurant(req.body.restaurant);
    restaurant.geometry = geoData.body.features[0].geometry;
    restaurant.images = req.files.map(f => ({url: f.path, filename: f.filename})); //it will parse all files and return an array of object [{url: link of photo , filename: file location}] it will be stored in mongodb
    //here we associate our owner who posted the restaurant ..since we need to be logged in while we post and we have access to req.user due to passport we can use that
    restaurant.author = req.user._id; //using id we will populate it
    await restaurant.save();
    // console.log(restaurant);
    req.flash('success', 'Successfully added a new restaurant');
    res.redirect(`/restaurants/${restaurant._id}`);

}

module.exports.showRestaurant = async (req,res,next) => {
    //in reviews model we have a reference of user model (author) so we need to populate that also so we will do nested populate i.e we will populate reviews and within it we will populate our user
    //each review will have separate owner so nesting is done
    const restaurant = await Restaurant.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');    //we are populating the reviews and author so that it can automatically see the ids and give us the reviews and author
    // console.log(restaurant);
    if(!restaurant){
        req.flash('error', 'Cannot find this particular restaurant');
        return res.redirect('/restaurants');      //return is done to tell that the execution stops here
    }
    res.render('restaurants/show', {restaurant});
}

module.exports.renderEditForm = async (req,res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if(!restaurant){
        req.flash('error', 'Cannot find this particular restaurant');
        return res.redirect('/restaurants');      //return is done to tell that the execution stops here
    }
    res.render('restaurants/edit', {restaurant});
}

module.exports.updateRestaurant = async (req,res) => {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant})
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));   //req.files will be available only if we added more photos
    restaurant.images.push(...imgs); //we cant directly map and push then it will become array of array...also we are spreading it
    await restaurant.save()
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);//it will be deleted from cloudinary storage
        }
        await restaurant.updateOne({$pull: { images: {filename: { $in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated restaurant details');
    res.redirect(`/restaurants/${restaurant._id}`);
}

module.exports.deleteRestaurant = async (req,res) => {
    const {id} = req.params;
    const restaurant = await Restaurant.findByIdAndDelete(id);
    for (let image of restaurant.images) {
        await cloudinary.uploader.destroy(image.filename);
    } 
    req.flash('success', 'Successfully deleted the restaurant');
    res.redirect('/restaurants');
}