// import JOI schemas to use for data validation (make sure data is corret type, etc)
const {campgroundSchema, reviewSchema} = require('./JOIschemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    // console.log('REQ.USER...', req.user);
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}


// not an app.use becuase we want this selectively applied
module.exports.validateCampground = (req, res, next) => {
    // Validates a value using the current schema and options where: value (req.body)- the value being validated.
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

// middleware to check if a user is an author (permissions)
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to edit campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// middleware to check if a user is an author (permissions)
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to edit campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


// middleware that will be selectively applied to prevent empty reviews created by someone not on the client side using postman, ajax, etc to send a request -- is based off ofour joischemas which gave different parts of the review model requirements 
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    console.log(error)
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

