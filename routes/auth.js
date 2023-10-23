const {Driver}=require('../models/driver');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config=require('config'); 
const _ = require('lodash')
const { User } = require('../models/user');
const { async } = require('@firebase/util');

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
    const decoded = jwt.verify(token,config.get('driverPrivateKey'));
    return res.header('x-auth-token',token).send(decoded.role)
    
});
router.post('/byPhone',async(req,res)=>{
    
    try{
        if(!req.body.phone)
        return res.status(400).send('Phone required.')

        let user=await Driver.findOne({phone:req.body.phone})
    
        if(!user)
        user = await User.findOne({phone:req.body.phone});
        
        if(!user)
        
        return res.status(400).send('No account registered with the given phone found.');

        const token = user.generateAuthToken();

        const decoded = jwt.verify(token,config.get('driverPrivateKey'));
        return res.header('x-auth-token',token).send(decoded.role)
    }catch(ex){
        return res.status(500).send(ex)
    }
})

function validateSignin(driver){
    const schema =Joi.object().keys({
        
        email:Joi.string().email().required().min(5).max(255),
        password:Joi.string().required().min(5).max(255),
    })
    return schema.validate(driver);
}

module.exports=router;