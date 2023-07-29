const router = require('express').Router()
const {Admin,validate} = require('../models/admin')
const bcrypt = require('bcrypt')



router.post('/register',async(req,res)=>{
    const {first_name,last_name,email,password,phone} = req.body
    const {error} = validate(req.body)
    if(error)
    return res.status(400).send(error.details[0].message)
    try{
        let admin = await Admin.findOne({email})
        if(admin)
        return res.status(400).send('Email already taken.')
        
        admin = new Admin({first_name,last_name,email,password,phone})
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password,salt); 
        await admin.save()
        const token = admin.generateAuthToken();
        return res.header('x-auth-token',token).send(admin);
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})

router.get('/',async(req,res)=>{
    try{
        const admins = await Admin.find()
        if(!admins)
        return res.send('No admins registered.')
        return res.send(admins)
    }catch(err){
        console.log(err)
        res.status(500).send(err)
    }
})
router.get('/:id',async(req,res)=>{
    try{
        const admin = await Admin.findById(req.params.id)
        if(!admin)
        return res.status(400).send('The admin with the given id was not found.')
        return res.send(admin)
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})
router.put('/',async(req,res)=>{
    const {first_name,last_name,email,password,phone} = req.body
    try{
        let admin = await Admin.findById(req.user)
        if(first_name)
        admin.first_name = first_name
        if(last_name)
        admin.last_name = first_name
        if(email)
        admin.email = email
        if(password){
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password,salt)
        }
        if(phone)
        admin.phone = phone
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})
router.delete('/:id',async(req,res)=>{
    try{
        const admin = await Admin.findByIdAndRemove(req.params.id)
        return res.send(`Admin with the id ${admin._id} has been destroyed`)
    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})
module.exports=router