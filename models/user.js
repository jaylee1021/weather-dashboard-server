const mongoose = require('mongoose');

// create the user schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    unit: String,
    userWindUnit: String,
    userWindGustUnit: String,
    wind: Number,
    showWind: Boolean,
    windGust: Number,
    showWindGust: Boolean,
    tempLow: Number,
    tempHigh: Number,
    showTemp: Boolean,
    precipitation: Number,
    showPrecipitation: Boolean,
    visibility: Number,
    showVisibility: Boolean,
    cloudBaseHeight: Number,
    showCloudBaseHeight: Boolean,
    densityAltitudeLow: Number,
    densityAltitudeHigh: Number,
    showDensityAltitude: Boolean,
    lighteningStrike: Number,
    showLighteningStrike: Boolean,
    showWindDirection: Boolean,
}, { timestamps: true });

// create model
const User = mongoose.model('User', userSchema);

// export the model to be used
module.exports = User;