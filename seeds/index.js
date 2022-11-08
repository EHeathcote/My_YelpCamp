// This file willl contain logic to seed our yelp-camp Mongo database

// connect to js docs of infoo we need to seed
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
// require axios for use of the unspalsh api

// connect to mongoose and use my model
const mongoose = require('mongoose');
const Campground = require('../models/campground');

// get mongoose to connect to mongodb server-specify where to find mongo db locally or if in prod use prod db and also which db to use, here we see  db
mongoose.connect('mongodb://localhost:27017/yelp-camp');

// set db to mongoose.connection to shorten code
const db = mongoose.connection;
// if there is an error 
db.on('error', console.error.bind('connection error:'));
// if db connection successfully opened
db.once('open', () => {
    console.log('DATABASE CONNECTED')
});

// pass in the array and eturn a random elemnt from the array 
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// call unsplash and return small image

// async function seedImg() {
//     try {
//         const resp = await axios.get('https://api.unsplash.com/photos/random', {
//             params: {
//                 client_id: 'O_HZx2-N2b3V70UYobfAMO9rMde_kLBzFL_VCqiVXpY',
//                 collections: 483251,
//             },
//         })
//         return resp.data.urls.small
//     } catch (err) {
//     console.error(err)
//     }
// }

// SEED DB FUNCTION
const seedDB = async() => {
    //mongoose method Model.deleteMany all prior records
    await Campground.deleteMany();

    for (let i=0; i<5; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            // set an author -hardcoded to my user id
            author: '63500f5aa50ac9116ee0a7a9',
            // generate random city/state location 
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
              type: 'Point',
              coordinates: [
                cities[random1000].longitude, 
                cities[random1000].latitude
              ]
            },
            // generate a campground title using random descriptors/places from seedHelper
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: await seedImg(), 
            images: [
                {
                  url: 'https://res.cloudinary.com/dnkrnfe9q/image/upload/v1667585407/YelpCamp/DEFAULTCAMPIMAGE-scott-goodwill-y8Ngwq34_Ak-unsplash_tydcfr.jpg',        
                  filename: 'YelpCamp/DEFAULTCAMPIMAGE-scott-goodwill-y8Ngwq34_Ak-unsplash_tydcfr.jpg',
                },
                {
                  url: 'https://res.cloudinary.com/dnkrnfe9q/image/upload/v1667585407/YelpCamp/DEFAULTCAMPIMAGE-scott-goodwill-y8Ngwq34_Ak-unsplash_tydcfr.jpg',        
                  filename: 'YelpCamp/DEFAULTCAMPIMAGE-scott-goodwill-y8Ngwq34_Ak-unsplash_tydcfr.jpg',
                }
              ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus perspiciatis accusantium commodi necessitatibus culpa dignissimos, aut quos rem eius eos voluptates alias quibusdam explicabo! Officiis maxime eius reiciendis molestiae Lorem ipsum dolor sit amet consectetur, adipisicing elit. Amet commodi placeat quod tempora neque doloremque impedit consectetur vitae, natus, perferendis beatae error fuga nobis aspernatur nihil ab. Aliquam, nulla corrupti?',
            price: randomPrice
        })
        await camp.save();
    }
};


// close the mongoose connection after we have seeded the db so if we call this file in the future to seed, we do not leave the connection open
seedDB().then(() => {
    mongoose.connection.close();
});