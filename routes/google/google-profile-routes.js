const router = require('express').Router()
const {authCheck} = require('../../middleware/auth')
router.get('/',authCheck,(req,res)=>{
    res.render('profile',{user:req.user})
})
module.exports = router