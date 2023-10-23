const bcrypt = require('bcrypt');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const {User,validate,validatePhone}=require('../models/user');
const {Driver} = require('../models/driver');
const _ = require('lodash');
const { isUndefined } = require('lodash');
const {auth} = require('../middleware/auth');
const storage = multer.memoryStorage();
const upload = multer({storage});





//register user
router.post('/register',upload.single('image'),async (req,res)=>{
    
    const {error} = validate(req.body);
    if(error)
    return res.status(400).send(error.details[0].message);

    
    let driver = await Driver.findOne({email: req.body.email})
    if (driver) return res.status(400).send('Email already taken.');

    let user = await User.findOne({email:req.body.email});
    if(user)
    return res.status(400).send('Email already taken.');

    if(await User.findOne({phone:req.body.phone})||await Driver.findOne({phone:req.body.phone}))
    return res.status(400).send('Phone already taken')
    

    if(req.file){
        user = new User({
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            email : req.body.email,
            password: req.body.password,
            phone:req.body.phone,
            image:{
                name:req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype
                }
        }); 
    }
    else{
        user = new User({
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            email : req.body.email,
            password: req.body.password,
            phone:req.body.phone
        });
    }
   



    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);
    await user.save();
    const token = user.generateAuthToken();
    return res.header('x-auth-token',token).send(_.pick(user,['first_name','email']));
    
});

//register user by phone
router.post('/registerByPhone',upload.single('image'),async (req,res)=>{
    
    const {error} = validatePhone(req.body);
    if(error)
    return res.status(400).send(error.details[0].message);

    
    let driver = await Driver.findOne({phone: req.body.phone})
    if (driver) return res.status(400).send('phone already taken.');

    let user = await User.findOne({phone:req.body.phone});
    if(user)
    return res.status(400).send('phone already taken.');
    if(req.file){
        user = new User({
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            // email : req.body.email,
            // password: req.body.password,
            phone:req.body.phone,
            image:{
                name:req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype
                }
        }); 
    }
    else{
        user = new User({
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            // email : req.body.email,
            // password: req.body.password,
            phone:req.body.phone
        });
    }
   
    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password,salt);
    }
    await user.save();
    const token = user.generateAuthToken();
    return res.header('x-auth-token',token).send(_.pick(user,['first_name','email']));
    
});


router.get('/',auth(['Admin']),async(req,res)=>{
    try{
        const users = await User.find().select({image:0})
        if(!users)
        return res.send('No users registered.')
        return res.send(users)
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})

router.get('/:id',auth(['Admin']),async (req,res,next)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user)
        return res.status(404).send('The user with the given id was not found.');
        return res.send(user);

    }
    catch(ex){
        next(ex)
    }
})

router.get('/getInfo',auth(['User']),async(req,res)=>{
    try{
    const user = await User.findById(req.user)
    if(!user)
    return res.send('User not found.')
    return res.send(user)
    }catch(ex){
        return res.status(500).send(ex)
    }
})

router.put('/editInfo',[upload.single('image'),auth(['User'])],async (req,res)=>{
    
    let user = await User.findById(req.user)
    if(!req.body){
        res.send('Nothing changed.')
    }

    if(req.body.phone){
        if(await User.findOne({phone:req.body.phone})||await Driver.findOne({phone:req.body.phone}))
        return res.status(400).send('Phone already taken')
        user.phone = req.body.phone
        }
    if(req.body.email){
        if(await User.findOne({email:req.body.email})||await Driver.findOne({email:req.body.email}))
        return res.send("Email already taken.")
        user.email = req.body.email
    }

    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password,salt);
    }
    if(req.body.first_name)
        user.first_name = req.body.first_name
    if(req.body.last_name)
        user.last_name = req.body.last_name
        
    
    if(req.file){
    user.image={
        name:req.file.originalname,
        data: req.file.buffer,
        contentType: req.file.mimetype
        }
    }
    await user.save()
    
    return res.send(user)


})
router.delete('/delete/:id',auth(['Admin']),async(req,res)=>{
    try{
        const user = await User.findByIdAndRemove(req.params.id)
        return res.send(`User with the id ${user._id} has been destroyed`)
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})
router.put('/pointsIncrease',auth(['Admin']),async(req,res)=>{
    const {pointsIncreased} = req.body
    try{
        let user = await User.findById(req.user)
        if(!user)
        return res.status(400).send('User not found.')
        user.points+=pointsIncreased
        await user.save()
        return res.send({'You have gained:':pointsIncreased,'Your points are:':user.points})
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})
module.exports=router;