const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
// geocoder contains the forward and reverse geocode methods from mapbox
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async(req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // using mapbox to geocode an location input by the user
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    // adds the location input to campground object 
    campground.geometry = geoData.body.features[0].geometry;
        // The map() method creates a new array populated with the results of calling a provided function on every element in the calling array, will map the files from req.files submitted and format them with the function
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`); 
}


module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', 
        populate: {
            path: 'author'
        }
    }).populate('author');
    // flash if trying to access a campground by an id that doesnt exist in db
    if (!campground) {
        req.flash('error', 'Campground does not exist');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground does not exist');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    // console.log(req.body);
    // using spread operator to spread new campground info from the body into the object
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    // The map() method creates a new array populated with the results of calling a provided function on every element in the calling array, will map the files from req.files submitted and format them with the function --since we are using push, we dont actually want to push an array onto an existing array, so we can make the array of images a separate var imgs
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    // and then spread that into the push method so push will ad don each new image separately rather than as one array of images
    campground.images.push(...imgs);
    // logic to delete images selected by user
    if (req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            // using cloudinary method destroy to delete the selected images from cloudinary
            await cloudinary.uploader.destroy(filename)
        }
        // query to select images to pull elements out of the images array (bsically deleteing the images from the campground object in mongo) where the filename on each image is in req.body.deleteImages
        await campground.updateOne({$pull :{images: {filename: {$in: req.body.deleteImages} } } })
    };
    await campground.save();
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`); 
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted campground!');
    res.redirect('/campgrounds');
}