const {Driver,validatedriver ,validatedriverEmail,updateValidatedriver, validatedriverPassword}=require('../models/driver');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {auth} = require('../middleware/auth');
const multer  = require('multer');
const { User } = require('../models/user');
const upload = multer()

// router.get('/', async (req,res)=>{
//     try{
// const drivers =await Driver.find();
// res.send( drivers);
//     }
//     catch(err){
// res.status(500).send(err.message);
//     }
// });

router.get('/:id',async(req,res)=>{

    try{
        const driver =await Driver.findById(req.params.id);
        if(!driver) return res.status(404).send('driver not found');
        res.send( driver);
            }
            catch(err){
            res.status(500).send(err.message);
            }

});

router.post('/',upload.single('image'),async(req,res)=>{

    const {error}= validatedriver(req.body);

    if(error) return res.status(400).send(error.details[0].message);



    let driver = await Driver.findOne({email: req.body.email})
    if (driver) return res.status(400).send('Email already taken');

    let user = await User.findOne({email: req.body.email})
    if (user) return res.status(400).send('Email already taken');

    driver = new Driver({
        image:
        {
            name:req.file.originalname,
            data: req.file.buffer,
            contentType:req.file.mimetype
        },
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phone:req.body.phone,
        email:req.body.email,
        password:req.body.password,
        carSpecifications:{
            company:req.body.company,
            color:req.body.color,
            carNumber:req.body.carNumber,
            capacity:req.body.capacity,
            class:req.body.class
        },
    });
    const salt= await bcrypt.genSalt(10);
    driver.password= await bcrypt.hash(driver.password,salt);
    await driver.save();

    const token = driver.generateAuthToken();
    res.status(201).header('x-auth-token',token).send(driver);

});

router.put('/editInfo',[upload.single('image'),auth],async(req,res)=>{
    const {error}= updateValidatedriver(_.omit(req.body,['email','password']));
    if(error) return res.status(400).send(error.details[0].message);

    let driver=await Driver.findByIdAndUpdate(req.user._id,{
        $set:{
            image:
            {
                name:req.file.originalname,
                data: req.file.buffer,
                contentType:req.file.mimetype
            },
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            phone:req.body.phone,
            carSpecifications:{
                company:req.body.company,
                color:req.body.color,
                carNumber:req.body.carNumber,
                capacity:req.body.capacity,
                class:req.body.class
            }
        }
    },{new:true});
    
   return res.send(driver);

});

// router.put('/editLocation', async (req,res)=>{
//     const driver = await  Driver.findByIdAndUpdate(req.body.id,{$set:{
//         'location.0':55
//     }})
//     return res.send (driver)
    
// })

router.put('/editEmail',auth,async(req,res)=>{
    const {error}= validatedriverEmail(_.pick(req.body,['email']));
    if(error) return res.status(400).send(error.details[0].message);

    let driver = await Driver.findOne({email: req.body.email})
    if (driver) return res.status(400).send('email already taken');

    driver=await Driver.findByIdAndUpdate(req.user._id,{
        $set:{
            email:req.body.email
        }
    },{new:true});
    
   return res.send(driver);

});

router.put('/editPassword',auth,async(req,res)=>{
    const {error}= validatedriverPassword(_.pick(req.body,['password']));
    if(error) return res.status(400).send(error.details[0].message);

    const salt= await bcrypt.genSalt(10);
   const newPassword= await bcrypt.hash(req.body.password,salt);
    const driver=await Driver.findByIdAndUpdate(req.user._id,{
        $set:{
           password: newPassword
        }
    },{new:true});
    
   return res.send(driver);

});

router.delete('/',auth,async (req,res)=>{
    try{

    const driver = await Driver.findByIdAndRemove(req.user._id);
    res.send(driver);
}catch(err){
    res.status(500).send(err.message);
}
});

module.exports=router;