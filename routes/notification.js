const {Driver}=require('../models/driver');
const {User}=require('../models/user');
const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const { pushNotificationWithMessage}= require('../models/notification');

router.put('/fcmToken',auth,async (req,res)=>{

    const fcmToken = req.body.fcmToken;

    let user=await User.findByIdAndUpdate(req.user._id,{
        $set:{
            fcmToken:fcmToken
        }
    },{new:true});
    if(!user){
     user=await Driver.findByIdAndUpdate(req.user._id,{
        $set:{
            fcmToken:fcmToken
        }
    },{new:true});
    }
     
    res.send(user);

});
router.get('/push',async (req,res)=>{

    const fcmToken = 'edj1FQaYQgSbYVsHDgu-DA:APA91bGWDutBhScbK-v7alBPR71uB_YsnAFBOblBfH-sLSxKiTaSnM5bEfwpKsOlPLtsGtfA_kt9wnlNphhGzZRLOjJWxB6Lmh5QbkDT57dmvu3RJd3njv8IZz6xqjiG8kavdxuNuldn';
    const message = {
        notification: {
          title: "Hii ",
          body:`Islam  `,
        
        },
        token: fcmToken,
      };
      pushNotificationWithMessage(message);
      res.send('noti send')

});
module.exports=router;