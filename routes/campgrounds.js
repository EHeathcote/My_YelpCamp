const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
// require campgorunds controller
const multer = require('multer');
const {storage} = require('../cloudinary')
// pass in config object, is the destination for where you will store the files ; --upload.array() is a multer methood to parse image info
const upload = multer({storage}); 

const campgrounds = require('../controllers/campgrounds');


router.route('/')
    // show list of campgrounds
    .get(catchAsync(campgrounds.index))
    // create a new campground in using data in the form, save to db and save file info uploaded to cloudinary, redirect to page of info for new campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

    // specify a field name which matches teh field name on our form ('image')



// bring us to the form to input a new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
    // show the details of a particular campground using its id, then we can populate with teh reviews of from users in the users db as well as the author which we can populate from the users db
    .get(catchAsync(campgrounds.showCampground))
    // use .findByIdAndUpdate to save the newly entered campground info from req.body into the campground object using the original Id
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    // delete a campsite
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))



// serve campground update form prefilled with past data
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;