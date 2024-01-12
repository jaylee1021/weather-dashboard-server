const mongoose = require('mongoose');

// create the user schema
const siteSchema = new mongoose.Schema({
    siteName: { type: String, required: true },
    siteLatitude: { type: Number, required: true },
    siteLongitude: { type: Number, required: true },
}, { timestamps: true });

// create model
const Site = mongoose.model('Site', siteSchema);

// export the model to be used
module.exports = Site;