// const passport = require('passport');

// // const googlestrategy=require('passport-google-oauth2').Strategy;

// // passport.serializeUser((user,done)=>{
// //     done(null,user);
// // })
// // passport.deserializeUser(function(user,done){
// //     done(null,user);
// // });

// // passport.use(new googlestrategy({
// //     clientID:process.env.client_id,
// //     clientSecret:process.env.client_secret,
// //     callbackURL:"http://localhost:3000/auth/google/callback",
// //     passReqToCallback:true
// // },
// // function(request,accesToken,refreshToken,profile,done){
// //     return done(null,profile);
// // }))

// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// passport.use(new GoogleStrategy({
//     clientID: process.env.client_id,
//     clientSecret: process.env.client_id,
//     callbackURL: "http://localhost:3000/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

// passport.serializeUser((user,done)=>{
//     done(null,user);
// });

// passport.deserializeUser((user,done)=>{
//     done(null,user);
// })


const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config()

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URI ="http://localhost:3000/auth/google/callback";

// Initiates the Google Login flow
router.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});

// Callback URL for handling the Google Login response
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access token
    const { data } = await axios.post('<https://oauth2.googleapis.com/token>', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, id_token } = data;

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get('<https://www.googleapis.com/oauth2/v1/userinfo>', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Code to handle user authentication and retrieval using the profile data

    res.redirect('/');
  } catch (error) {
    console.error('Error:', error.response.data.error);
    res.redirect('/login');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Code to handle user logout
  res.redirect('/login');
});

module.exports = router;