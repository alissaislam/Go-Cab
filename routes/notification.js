const {Driver }=require('../models/driver');
const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const {pushNotification,pushNotificationToMany, pushNotificationWithMessage}= require('../models/notification');

router.put('/fcmToken',auth,async (req,res)=>{

    const fcmToken = req.body.fcmToken;

    
    const driver=await Driver.findByIdAndUpdate(req.user._id,{
        $set:{
            fcmToken:fcmToken
        }
    },{new:true});
     
    res.send(driver);

});
router.get('/push',async (req,res)=>{

    const fcmToken = 'edj1FQaYQgSbYVsHDgu-DA:APA91bGWDutBhScbK-v7alBPR71uB_YsnAFBOblBfH-sLSxKiTaSnM5bEfwpKsOlPLtsGtfA_kt9wnlNphhGzZRLOjJWxB6Lmh5QbkDT57dmvu3RJd3njv8IZz6xqjiG8kavdxuNuldn';
    const message = {
        notification: {
          title: "Hii Baby!!",
          body:`Islam miss Ahmad ❤☺ `,
        
        },
        token: fcmToken,
      };
      pushNotificationWithMessage(message);
      res.send('noti send')

});
module.exports=router;