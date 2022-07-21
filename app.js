//if we are in development environment then we will config .env file access our  secret codes that we dont want to make public
//but in production mode to access secret codes different way of configuration is done

if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
// Object keys starting with a $ or containing a . are reserved for use by MongoDB as operators. Without this sanitization, malicious users could send an object containing a $ operator, or including a ., which could change the context of a database operation. Most notorious is the $where operator, which can execute arbitrary JavaScript on the database.
// The best way to prevent this is to sanitize the received data, and remove any offending keys, or replace the characters with a 'safe' one.
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//restaurants routes
const restaurantRoutes = require('./routes/restaurants');

//reviews routes
const reviewRoutes = require('./routes/reviews');
//it will store our session in mongo
const MongoStore = require('connect-mongo');
//users routes
const userRoutes = require('./routes/user');
const dburl = 'mongodb://localhost:27017/restaurant';
//'mongodb://localhost:27017/restaurant'
mongoose.connect(dburl, {useNewUrlParser: true, useUnifiedTopology: true})        //it returns a promise if connection is done or not so you can use then(succesful connection) and catch for error
    .then(() =>{
        console.log('CONNECTION OPEN!!')
    })
    .catch(err => {     //we can omit paranthesis when we have exactly one parameter in arrow function
        console.log('Oh no error');
        console.log(err);
    })



app.engine('ejs', ejsMate);   //this is for ejs-mate which helps to add boilerplate
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));   //it will serve the static files present in the public folder...static files are basically css/js/images that we need in our files which we display
app.use(mongoSanitize());
//we will use this mongo store now to store our data in mongo
const store = MongoStore.create({
    mongoUrl: dburl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24*60*60  //to avoid unnecessary resaves if the session is not updated do it after 24 hrs not after every refresh ...if its updated then it will automatically resave
});

store.on("error", function (e){
    console.log("SESSION STORE ERROR", e);
})


//using express session
//secret helps for hashing the uid and making it secure
//httpOnly makes it more secure because cookie cannot be accessed by third party
const sessionConfig = {
    store,  //now our session has a store so it will use mongo to store data
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,      //this makes it secure in https ...local host is http so in localhost this will break our code
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));

//for flash first we need to have session
app.use(flash());   //now we can access flash on our request object
app.use(helmet());  //if you only us this helmet then like below you also need to add all the links which you want to access otherwise your app will break


//content security we are only allowing our app to access these links no other links are allowed if you want to access some other link then you need to modify here
//if you dont want to do all these then simply pass {contentSecurityPolicy: false} to // app.use(helmet({contentSecurityPolicy: false}));  
const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/biswajitrout/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://static.dezeen.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());    //telling your app to use passport
app.use(passport.session());       //we need this for persistent login system - the user will be able to return to your site and not have to log in again till the cookie does not expires.

passport.use(new LocalStrategy(User.authenticate()));  //for the local strategy authenticate method is located in our user model
passport.serializeUser(User.serializeUser()); //tells how to store user info in session
passport.deserializeUser(User.deserializeUser());  //how to get a user info out of that session

app.use((req,res,next) => {
    // If authentication succeeds, the next handler will be invoked and the req.user property will be set to the authenticated user.
    //now we will have access to req.user in every route
    res.locals.currentUser = req.user;
    //if anything is set under the key name of success or error will be passed on to the response object
    res.locals.success = req.flash('success');    //when we flash and redirect our req object has an message associated with it which we are setting it res.locals.success which means we can directly access them in our templates and we dont need to pass them
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);   //for user routes

app.use('/restaurants', restaurantRoutes);    //anything that starts with /restaurants will be available in restaurants router

app.use('/restaurants/:id/reviews', reviewRoutes); //if you want to access the id property then you need to merge params in routes/reviews.js

app.get('/', (req,res) => {
    res.render('home');
});



//404 route if the url does not matches any of the route ...we are using all because it can be a get or post request
app.all('*', (req,res,next) => {
    // res.send('page not found');
    next(new ExpressError('Page not Found', 404));  // we are passing it to next error handler....expressError function is setting message and status and passes it to err
})

//error handler it will have 4 parameters
app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    // res.status(statusCode).send(message);
    if(!err.message) err.message = 'Something went wrong'      //we are checking if there is any message property on the error, if there is not such then we will set it to "Something went wrong".
    res.status(statusCode).render('error', {err});  //we are rendering a error template now
    // res.send('Something went wrong');
})

app.listen(3000, () => {
    console.log('Server runing on Port 3000');
})