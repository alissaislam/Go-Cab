const {Driver}=require('../models/driver');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { User } = require('../models/user');

router.post('/',async(req,res)=>{
    const {error}= validateSignin(req.body);
    if(error)
    return res.status(400).send(error.details[0].message);

    let user=await Driver.findOne({email: req.body.email})
    
    if(!user)
     user = await User.findOne({email:req.body.email});
    
    if(!user)
   
    return res.status(400).send('Invalid email or password');

    const validPassword= await bcrypt.compare(req.body.password,user.password);
    if(!validPassword)
    return res.status(400).send('Invalid email or password');

    const token = user.generateAuthToken();

    res.send(token);
    
});

function validateSignin(driver){
    const schema =Joi.object().keys({
        
        email:Joi.string().email().required().min(5).max(255),
        password:Joi.string().required().min(5).max(255),
    })
    return schema.validate(driver);
}

module.exports=router;