// MONGOOSE CAMPGROUND MODEL

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// In Mongoose, a virtual is a property that is not stored in MongoDB. Virtuals are typically used for computed properties on documents. Everytime we call thumbnail, we can transofrm our images (using cloudinary transformation in the url as below)
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200,h_125');
});

// set options so we can get virtuasls to show up in res.json object (mongoose)
const opts = { toJSON: { virtuals: true } };

// initialize a campground schema 
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts
)


// virtual property to create opup text specific to each campground for cluster map on campgrounds index.js 
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
            <p>${this.description.substring(0, 40)}...</p>`;
});

// when we delete a campground using findByIdAndDelete, the findOneAndDelete middleware will run, we will pass in the campground documen that we have deleted and then delete those specific reviews from the reviews object
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            // where the id
            _id: {
                // is somewhere in our doc.reviews
                $in: doc.reviews
            }
        })
    }
})


// eport our model with the schema
module.exports = mongoose.model('Campground', CampgroundSchema);