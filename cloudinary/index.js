const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//we need to pass this cloudinary details to our cloudinary-storage...this is not there in docs...cloud_name,api_key,api_secret should be of this name process.env names are upto you
//this is associating our account
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
//we have passed the above cloudinary instance(to associate our storage) and the folder name in cloudinary where we will store things
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'FoodieHub',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}