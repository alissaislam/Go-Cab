const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')
const {User} = require('../models/user')
const {Driver} = require('../models/driver')
passport.serializeUser((user,done)=>{
    done(null,user.id)
})

passport.deserializeUser((id,done)=>{
    User.findById(id).then((user)=>{
        done(null,user)
    }).catch((error)=>{console.log(error)})
})


passport.use(
    new GoogleStrategy({
        callbackURL:'http://localhost:3000/auth/google/redirect',
        clientID : keys.google.clientID,
        clientSecret: keys.google.clientSecret, 
    },(accessToken,refreshToken,profile,done)=>{
        //passport callback function
            User.findOne({googleId:profile.id}).then((currentUser)=>{
            if(currentUser){
            console.log('user is,',currentUser)
            try{
                done(null,currentUser)

            }catch(err){
                console.log(err)
            }
            }else{
                new User({
                    googleId:profile.id,
                    username:profile.displayName,
                    first_name:profile.name.givenName,
                    last_name:profile.name.familyName,
                    email:profile.emails[0].value
                }).save().then((newUser)=>{
                    done(null,newUser)
                })
            }
        })
    })
)