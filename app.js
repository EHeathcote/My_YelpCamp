if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
};
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
// monngo sanitize prevent mongo injection in query 
const mongoSanitize = require('express-mongo-sanitize');

const session = require('express-session');
const flash = require('connect-flash')
// const { notStrictEqual } = require('assert');
const ExpressError = require('./utils/ExpressError');
const methodOverride= require('method-override');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

// require doc with full router paths 
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const MongoStore = require('connect-mongo');

// get mongoose to connect to mongodb server-specify where to find mongo db locally or if in prod use prod db and also which db to use, here we see  db running locally on the default port (27017)
dbUrl = process.env.MONGODB_ATLAS_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);


// set db to mongoose.connection to shorten code
const db = mongoose.connection;
// if there is an error 
db.on('error', console.error.bind('connection error:'));
// if db connection successfully opened
db.once('open', () => {
    console.log('DATABASE CONNECTED');
});

// ----------------------------------------------------------------------------------------------
const app = express();

// tell express we want to use ejs-mate as our engine instead of default
app.engine('ejs', ejsMate);
// set view engine
app.set('view engine', 'ejs');
// set views directory using absolute path
app.set('views', path.join(__dirname, 'views'));

// ----------------------------------------------------------------------------------------------
// will help pars req.body so we can get params and inputs from things like forms
app.use(express.urlencoded({extended: true}));
// allows us to submit forms from the browser using more than just get or post requests
app.use(methodOverride('_method'));
// telling express to serve our public directory with static assets,  telling Node.js to use __dirname (absolute path of current directory) to point to the public directory that contains static files
app.use(express.static(path.join(__dirname, 'public')));
// tell to use mongosanitize on every request
app.use(mongoSanitize());


// ----------------------------------------------------------------------------------------------
// setting up session store on MongoDB using connect-mongo package
const secret = process.env.SECRET || 'thisshouldbeasecret';

const store = MongoStore.create({ 
    mongoUrl: dbUrl, 
    secret: secret,
    touchAfter: 24 * 60 * 60 // 24hr time period in seconds
 });
// in the case of a store session error display the error
store.on('error', function(e){
    console.log('SESSION STORE ERROR', e)
});

// setting up sessions (for cookies/flash)
const sessionConfig = {
    store: store, 
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // our cookies set through teh session are only accessible though http (not javascript)
        httpOnly: true,
        // secure: true;
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

// setting up helmet which sets headers to prevent cross site script attacks
// automatically eneables helmet middleware for secure response headers
// app.use(helmet());

const scriptSrcUrls = [
    // "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    // "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://*.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

// configure helmet
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
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc   : [ "https://res.cloudinary.com/dlzez5yga/" ],
            childSrc   : [ "blob:" ]
        }
    }));

// trying to ring ins tuff from  mapbox thats not from our servre same for cloudinary-we r making requests to them but coep says we only trust stuff that comes from oru server

app.use(passport.initialize());
app.use(passport.session());
// use the local log in strategy and it is located on our user model in a method called authenticate (an included static method) or User.createStrategy() in parens 
passport.use(new LocalStrategy(User.authenticate()));
// tells passport how to serialize user or store a user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'colt@gmail.com', username: 'coltttt'});
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
});

// Please make sure you have your app.use for currentUser after the passport related middlewares as the passport middlewares are needed for req to have the user - objectapp.use(passport.initialize());
// middleware to take anything in the flash for any request in a session and will add it in as a local variable for that request
// get access to current user in all templates so we can show or hide things based on if someone is a registerred logged in user or not
app.use((req, res, next) => {
    // console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.redirectUrl = req.session.returnTo;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});




// ----------------------------------------------------------------------------------------------


// ROUTES via middleware:
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {
    res.render('home');
});


// error handler
app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'Something Went Wrong'} = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!';
    res.status(statusCode).render('error', {err});
});


// app.all('*', (req, res, next) =>{
//     next(new ExpressError('Page Not Found', 404))
// })

// port would refer to the deployment app port serving our app
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`SERVING ON http://localhost:${port}`);
});