const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Googlestratagy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const dotenv = require('dotenv').config();
const app = express();
const User = require('./model/usermodel');

// Database connectivity
mongoose.connect(process.env.DB_URL,{useNewUrlParser:true}).then(()=>{
    console.log('Database connected successfully');
}).catch(err=>{
    console.log(err);
})

//session
app.use(session({
    secret:process.env.SESSION_SECRET,
    saveUninitialized:false,
    resave:false
}))

//passport configuration
app.use(passport.initialize());
app.use(passport.session());

//configure google strategy
passport.use(new Googlestratagy({
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL:'http://localhost:3000/auth/google/callback'
},(accessToken,refreshToken,profile,done)=>{
    const user = new User({
        googleId:profile.id,
        displayName:profile.displayName,
        email:profile.emails[0].value
    })
    user.save().then(()=>{
        console.log('user sign in successfully');
    }).catch((err)=>{
        console.log(err.message);
    })
    return done(null,profile);
}))
  
//configure serialization and dserialization
passport.serializeUser((user,done)=>{
    done(null,user);
})
passport.deserializeUser((user,done)=>{
    done(null,user);
})

//routes
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})
app.get('/auth/google',passport.authenticate("google",{scope:['profile','email']}));
app.get('/auth/google/callback',passport.authenticate("google",{successRedirect:'/success',failureRedirect:'/error'}));
 
//app listen
app.listen(process.env.PORT||3000,()=>{
    console.log('server starts on 3000');
})