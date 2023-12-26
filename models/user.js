const mongoose = require('mongoose');

// create the user schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    unit: String,
    userWindUnit: String,
    userWindUnitChange: Boolean,
    userWindGustUnit: String,
    userWindGustUnitChange: Boolean,
    userTempUnit: String,
    wind: Number,
    windGust: Number,
    tempLow: Number,
    tempHigh: Number,
    precipitation: Number,
    visibility: Number,
    cloudBaseHeight: Number,
    densityAltitudeLow: Number,
    densityAltitudeHigh: Number,
    lighteningStrike: Number
}, { timestamps: true });

// create model
const User = mongoose.model('User', userSchema);

// export the model to be used
module.exports = User;