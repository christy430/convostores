const passport = require('passport');
require('dotenv').config()
// const googlestrategy=require('passport-google-oauth2').Strategy;

// passport.serializeUser((user,done)=>{
//     done(null,user);
// })
// passport.deserializeUser(function(user,done){
//     done(null,user);
// });

// passport.use(new googlestrategy({
//     clientID:process.env.client_id,
//     clientSecret:process.env.client_secret,
//     callbackURL:"http://localhost:3000/auth/google/callback",
//     passReqToCallback:true
// },
// function(request,accesToken,refreshToken,profile,done){
//     return done(null,profile);
// }))

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.client_id,
    clientSecret: process.env.client_secret,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((user,done)=>{
    done(null,user);
})