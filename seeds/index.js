
const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant');    //yeh Restaurant model ka naam hai ab kyunki wahan se model export hua tha
const cities = require('./cities');
const {places , descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/restaurant', {useNewUrlParser: true, useUnifiedTopology: true})        //it returns a promise if connection is done or not so you can use then(succesful connection) and catch for error
    .then(() =>{
        console.log('CONNECTION OPEN!!')
    })
    .catch(err => {     //we can omit paranthesis when we have exactly one parameter in arrow function
        console.log('Oh no error');
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDb = async () => {
    await Restaurant.deleteMany({});
    for(let i=0;i<4;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        
        const c = new Restaurant({
            author: '6148e65040ebe4e76bde8271',
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            images : [
                {
                  url: 'https://res.cloudinary.com/biswajitrout/image/upload/v1632412213/FoodieHub/ldpucs5vpswbxq5it2p1.jpg',
                  filename: 'FoodieHub/ldpucs5vpswbxq5it2p1'
                },
                {
                  url: 'https://res.cloudinary.com/biswajitrout/image/upload/v1632412213/FoodieHub/p35zds6qroufv9ydovnq.jpg',
                  filename: 'FoodieHub/p35zds6qroufv9ydovnq'
                }
            ],
            description : 'A restaurant, or, more informally, an eatery, is a business that prepares and serves food and drinks to customers',
            geometry : { 
                "type" : "Point", 
                "coordinates" : [ -73.9866, 40.7306 ] 
            }
        });
        await c.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})