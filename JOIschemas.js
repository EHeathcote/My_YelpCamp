const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');    
    




// escaping html to prevent cross site scriping (can occur in the marker on maps)
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must  not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // sanitizeHTML package
                const clean = sanitizeHTML(value, {
                    allowedTRags: [],
                    allowedAttributes:{},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)



// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
// Server side validations - not a mngoose scheme, will attemp to validate our data before we save it with mongoose or involve mongoose at all through middleware exampleSchema.validate(req.body)
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    // deleteImages is an array which contains the images checked since in our campgrounds edit ejs we have named teh checkbox as deleteImages[] and teh value of that checkbox as the filename for the image so teh filename is added to the array deleteImages when we parse the body
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML() 
    }).required()
})

