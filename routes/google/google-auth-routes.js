const router = require('express').Router()
const passport = require('passport')

router.get('/login',(req,res)=>{
    res.render('login',{user:req.user})
})
router.get('/logout',(req,res)=>{
    req.logout(),
    res.redirect('/')
})

router.get('/google',passport.authenticate('google' ,{
    scope:[
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}))

router.get('/google/redirect',passport.authenticate('google'),(req,res)=>{
    res.redirect('/profile/')
})

module.exports = router