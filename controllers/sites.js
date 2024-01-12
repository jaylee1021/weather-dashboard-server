// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;

// import the Site model
const { Site } = require('../models');

// GET make a users route to get all users
router.get('/', (req, res) => {
    Site.find({})
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

// GET make a site route to get a site by id
router.get('/:id', (req, res) => {
    Site.findById(req.params.id)
        .then((site) => {
            console.log('site', site);
            // res.header("Access-Control-Allow-Origin", "*");
            res.json({ site: site });
        })
        .catch((error) => {
            console.log('error', error);
            // res.header("Access-Control-Allow-Origin", "*");
            res.json({ message: 'There was an issue, please try again...' });
        });
});

// other routes below
// GET make a route that queries users by [email domain] [zipCode] [state]
router.get('/:field/:value', (req, res) => {
    if (req.params.field === 'zipcode' || req.params.field === 'zipCode') {
        let zipCode = parseInt(req.params.value);
        // find all users based on zipCode
        Site.find({ "address.zipCode": zipCode })
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
        Site.find({ email: req.params.value })
            .then((site) => {
                console.log('site', site);
                res.header("Access-Control-Allow-Origin", "*");
                return res.json({ site: site });
            })
            .catch((error) => {
                console.log('error', error);
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: 'There was an issue, please try again...' });
            });
    }
});

// Post Route for new Site
router.post('/newSite', (req, res) => {
    console.log('data from request (site)', req.body); // object
    // Find a site
    Site.findOne({ siteName: req.body.siteName })
        .then((site) => {
            // check to see if site exist in database
            if (site) {
                // return a message saying site exist
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: `site name '${site.siteName}' already exists. Please try again` });
            } else {
                // create a site
                Site.create({
                    siteName: req.body.siteName,
                    siteLatitude: req.body.siteLatitude,
                    siteLongitude: req.body.siteLongitude,
                })
                    .then((newSite) => {
                        console.log('new site created ->', newSite);
                        res.header("Access-Control-Allow-Origin", "*");
                        return res.json({ site: newSite });
                    }
                    )
                    .catch((error) => {
                        console.log('error', error);
                        res.header("Access-Control-Allow-Origin", "*");
                        return res.json({ message: 'error occured, please try again.' });
                    }
                    );
            }
        })
        .catch((error) => {
            console.log('error', error);
            res.header("Access-Control-Allow-Origin", "*");
            return res.json({ message: 'error occured, please try again.' });
        });
});

router.put('/:id', (req, res) => {
    const updateQuery = {};
    // check siteName
    if (req.body.siteName) {
        updateQuery.siteName = req.body.siteName;
    }
    // check siteLatitude
    if (req.body.siteLatitude) {
        updateQuery.siteLatitude = req.body.siteLatitude;
    }
    // check siteLongitude
    if (req.body.siteLongitude) {
        updateQuery.siteLongitude = req.body.siteLongitude;
    }

    Site.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
        .then((site) => {
            return res.json({ message: `${site.siteName} was updated`, site: site });
        })
        .catch((error) => {
            console.log('error', error);
            return res.json({ message: 'error occured, please try again.' });
        });
});


// DELETE route for /users/:id
router.delete('/:id', (req, res) => {

    Site.findByIdAndDelete(req.params.id)
        .then((result) => {
            return res.json({ message: `site at ${req.params.id} was deleted` });
        })
        .catch((error) => {
            console.log('error inside DELETE /users/:id', error);
            return res.json({ message: 'error occured, please try again.' });
        });
});

module.exports = router;

// passport.authenticate('jwt', { session: false })