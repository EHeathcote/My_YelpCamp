const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    // pass in the review from the request body
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // add the review to the review array stored on that campground in mongo
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Made a new review!');
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    // find campground object and delete review from review property -pull mongo operator we will pull (remove) from the reviews array where we match the reviewId 
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // delete review based on review ID from review object
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted review!');
    res.redirect(`/campgrounds/${id}`);
}
