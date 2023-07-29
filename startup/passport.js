const keys = require('../config/keys')
const cookieSession = require('cookie-session')
const passport = require('passport')

module.exports = function(app){
    app.use(cookieSession({
        maxAge:24*60*60*1000,
        keys:[keys.session.cookieKey]
    }))

    app.use(passport.initialize())
    app.use(passport.session())

}