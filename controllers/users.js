// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;
const axios = require('axios');

// import the User model
const { User } = require('../models');

// GET make a users route to get all users
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.find({})
        .then((users) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ users: users });
        })
        .catch((error) => {
            console.log('error', error);
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ message: 'There was an issue, please try again...' });
        });
});

// GET make a user route to get a user by id
router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.params.id)
        .then((user) => {
            console.log('user', user);
            // res.header("Access-Control-Allow-Origin", "*");
            res.json({ user: user });
        })
        .catch((error) => {
            console.log('error', error);
            // res.header("Access-Control-Allow-Origin", "*");
            res.json({ message: 'There was an issue, please try again...' });
        });
});
// private
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('====> inside /profile');
    console.log(req.body);
    console.log('====> user');
    console.log(req.user);
    const { id, firstName, lastName, email, address, jobTitle, birthdate, number } = req.user; // object with user object inside
    res.json({ id, firstName, lastName, email, address, jobTitle, birthdate, number });
});

// Axios call to weather api and air quality api to get weather data
router.get('/weather/:city', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const city = req.params.city;
    if (city === 'hsiland') {
        latitude = process.env.NEXT_PUBLIC_HSILAND_LATITUDE;
        longitude = process.env.NEXT_PUBLIC_HSILAND_LONGITUDE;
    } else if (city === 'pdt10_hangar') {
        latitude = process.env.NEXT_PUBLIC_PDT10_HANGAR_LATITUDE;
        longitude = process.env.NEXT_PUBLIC_PDT10_HANGAR_LONGITUDE;
    } else if (city === 'pdt10_northpad') {
        latitude = process.env.NEXT_PUBLIC_PDT10_NORTH_PAD_LATITUDE;
        longitude = process.env.NEXT_PUBLIC_PDT10_NORTH_PAD_LONGITUDE;
    }
    try {
        const [weatherResponse, aqiResponse] = await Promise.all([
            axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${latitude},${longitude}`),
            axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi&hourly=us_aqi&timezone=America%2FLos_Angeles&forecast_days=1`)
        ]);
        const weatherData = weatherResponse.data;
        const forecast = weatherData.forecast.forecastday[0].hour;
        const weather = weatherData.current;
        const aqiData = aqiResponse.data;
        const windKnots = weather.wind_mph * 0.868976;
        const windGustKnots = weather.gust_mph * 0.868976;
        const windMS = weather.wind_mph * 0.44704;
        const windGustMS = weather.gust_mph * 0.44704;
        return res.json({
            forecast,
            weather,
            windKnots,
            windGustKnots,
            windMS,
            windGustMS,
            aqiData
        });
    } catch (error) {
        console.log(error);
    };
});

// GET make a route that queries users by [email domain] [zipCode] [state]
router.get('/:field/:value', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.params.field === 'zipcode' || req.params.field === 'zipCode') {
        let zipCode = parseInt(req.params.value);
        // find all users based on zipCode
        User.find({ "address.zipCode": zipCode })
            .then((users) => {
                console.log('users', users);
                res.header("Access-Control-Allow-Origin", "*");
                return res.json({ users: users });
            })
            .catch((error) => {
                console.log('error', error);
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: 'There was an issue, please try again...' });
            });
    } else if (req.params.field === 'email' || req.params.field === 'Email') {
        User.find({ email: req.params.value })
            .then((user) => {
                console.log('user', user);
                res.header("Access-Control-Allow-Origin", "*");
                return res.json({ user: user });
            })
            .catch((error) => {
                console.log('error', error);
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: 'There was an issue, please try again...' });
            });
    }
});

router.post('/signup', (req, res) => {
    // POST - adding the new user to the database

    User.findOne({ email: req.body.email })
        .then(user => {
            // if email already exists, a user will come back
            if (user) {
                // send a 400 response
                return res.status(400).json({ message: 'Email already exists' });
            } else {
                // Create a new user
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    unit: 'knots',
                    userWindUnit: 'knots',
                    userWindGustUnit: 'knots',
                    wind: 14,
                    showWind: true,
                    windGust: 25,
                    showWindGust: true,
                    tempLow: 32,
                    tempHigh: 91,
                    showTemp: true,
                    precipitation: 0,
                    showPrecipitation: true,
                    visibility: 3,
                    showVisibility: true,
                    cloudBaseHeight: 1000,
                    showCloudBaseHeight: true,
                    densityAltitudeLow: -2000,
                    densityAltitudeHigh: 4600,
                    showDensityAltitude: true,
                    lighteningStrike: 30,
                    showLighteningStrike: true,
                    showWindDirection: true,
                    windDirectionLow: -1,
                    windDirectionHigh: 361
                });

                // Salt and hash the password - before saving the user
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw Error;

                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) console.log('==> Error inside of hash', err);
                        // Change the password in newUser to the hash
                        newUser.password = hash;
                        newUser.save()
                            .then(createdUser => {
                                // remove password from being returned inside of response, still in DB
                                if (createdUser.password) {
                                    createdUser.password = '...'; // hide the password
                                    res.json({ user: createdUser });
                                }
                            })
                            .catch(err => {
                                console.log('error with creating new user', err);
                                res.json({ message: 'Error occured... Please try again.' });
                            });
                    });
                });
            }
        })
        .catch(err => {
            console.log('Error finding user', err);
            res.json({ message: 'Error occured... Please try again.' });
        });
});

router.post('/login', async (req, res) => {
    // POST - finding a user and returning the user
    console.log('===> Inside of /login');
    console.log('===> /login -> req.body', req.body);

    const foundUser = await User.findOne({ email: req.body.email });

    if (foundUser) {
        // user is in the DB
        let isMatch = await bcrypt.compareSync(req.body.password, foundUser.password);
        console.log('Does the passwords match?', isMatch);
        if (isMatch) {
            // if user match, then we want to send a JSON Web Token
            // Create a token payload
            // add an expiredToken = Date.now()
            // save the user
            const payload = {
                id: foundUser.id,
                email: foundUser.email,
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 * 6 }, (err, token) => {
                if (err) {
                    res.status(400).json({ message: 'Session has endedd, please log in again' });
                }
                const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });
                console.log('===> legit', legit);
                delete legit.password; // remove before showing response
                res.json({ success: true, token: `Bearer ${token}`, userData: legit });
            });

        } else {
            return res.status(400).json({ message: 'Email or Password is incorrect' });
        }
    } else {
        return res.status(400).json({ message: 'User not found' });
    }
});

// POST route /users/new - create a new user
router.post('/new', (req, res) => {
    // read the req.body - data for the new user coming in at
    console.log('data from request (user)', req.body); // object
    // Find a user
    User.findOne({ email: req.body.email })
        .then((user) => {
            // check to see if user exist in database
            if (user) {
                // return a message saying user exist
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: `${user.email} already exists. Please try again` });
            } else {
                // create a user
                User.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                })
                    .then((newUser) => {
                        console.log('new user created ->', newUser);
                        res.header("Access-Control-Allow-Origin", "*");
                        return res.json({ user: newUser });
                    })
                    .catch((error) => {
                        console.log('error', error);
                        res.header("Access-Control-Allow-Origin", "*");
                        return res.json({ message: 'error occured, please try again.' });
                    });
            }
        })
        .catch((error) => {
            console.log('error', error);
            res.header("Access-Control-Allow-Origin", "*");
            return res.json({ message: 'error occured, please try again.' });
        });
});

router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const updateQuery = {};
    // check firstName
    if (req.body.firstName) {
        updateQuery.firstName = req.body.firstName;
    }
    // check lastName
    if (req.body.lastName) {
        updateQuery.lastName = req.body.lastName;
    }
    // check email
    if (req.body.email) {
        updateQuery.email = req.body.email;
    }
    // check wind
    if (req.body.wind) {
        updateQuery.wind = req.body.wind;
    }
    // check show wind
    if ('showWind' in req.body) {
        updateQuery.showWind = req.body.showWind;
    }
    // check windGust
    if (req.body.windGust) {
        updateQuery.windGust = req.body.windGust;
    }
    // check show windGust
    if ('showWindGust' in req.body) {
        updateQuery.showWindGust = req.body.showWindGust;
    }
    // check tempLow
    if (req.body.tempLow) {
        updateQuery.tempLow = req.body.tempLow;
    }
    // check tempHigh
    if (req.body.tempHigh) {
        updateQuery.tempHigh = req.body.tempHigh;
    }
    // check show temp
    if ('showTemp' in req.body) {
        updateQuery.showTemp = req.body.showTemp;
    }
    // check precipitation
    if (req.body.precipitation) {
        updateQuery.precipitation = req.body.precipitation;
    }
    //check show precipitation
    if ('showPrecipitation' in req.body) {
        updateQuery.showPrecipitation = req.body.showPrecipitation;
    }
    // check visibility
    if (req.body.visibility) {
        updateQuery.visibility = req.body.visibility;
    }
    // check show visibility
    if ('showVisibility' in req.body) {
        updateQuery.showVisibility = req.body.showVisibility;
    }
    // check cloudBaseHeight
    if (req.body.cloudBaseHeight) {
        updateQuery.cloudBaseHeight = req.body.cloudBaseHeight;
    }
    // check show cloudBaseHeight
    if ('showCloudBaseHeight' in req.body) {
        updateQuery.showCloudBaseHeight = req.body.showCloudBaseHeight;
    }
    // check densityAltitude
    if (req.body.densityAltitude) {
        updateQuery.densityAltitude = req.body.densityAltitude;
    }
    // check show densityAltitude
    if ('showDensityAltitude' in req.body) {
        updateQuery.showDensityAltitude = req.body.showDensityAltitude;
    }
    // check lighteningStrike
    if (req.body.lighteningStrike) {
        updateQuery.lighteningStrike = req.body.lighteningStrike;
    }
    // check show lighteningStrike
    if ('showLighteningStrike' in req.body) {
        updateQuery.showLighteningStrike = req.body.showLighteningStrike;
    }
    // check unit
    if (req.body.unit) {
        updateQuery.unit = req.body.unit;
    }
    // check userWindUnit
    if (req.body.userWindUnit) {
        updateQuery.userWindUnit = req.body.userWindUnit;
    }
    // check userWindGustUnit
    if (req.body.userWindGustUnit) {
        updateQuery.userWindGustUnit = req.body.userWindGustUnit;
    }
    // check showWindDirection
    if ('showWindDirection' in req.body) {
        updateQuery.showWindDirection = req.body.showWindDirection;
    }

    // check windDirectionLow
    if (req.body.windDirectionLow) {
        updateQuery.windDirectionLow = req.body.windDirectionLow;
    }

    // check windDirectionHigh
    if (req.body.windDirectionHigh) {
        updateQuery.windDirectionHigh = req.body.windDirectionHigh;
    }

    User.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
        .then((user) => {
            return res.json({ message: `${user.email} was updated`, user: user });
        })
        .catch((error) => {
            console.log('error inside PUT /users/:id', error);
            return res.json({ message: 'error occured, please try again.' });
        });
});


// DELETE route for /users/:id
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    User.findByIdAndDelete(req.params.id)
        .then((result) => {
            return res.json({ message: `user at ${req.params.id} was delete` });
        })
        .catch((error) => {
            console.log('error inside DELETE /users/:id', error);
            return res.json({ message: 'error occured, please try again.' });
        });
});

module.exports = router;