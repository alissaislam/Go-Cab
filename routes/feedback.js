const { auth } = require('../middleware/auth')
const {Feedback} = require('../models/feedback')
const jwt = require('jsonwebtoken')
const config = require('config')
const router = require('express').Router()

router.post('/',auth(['Driver','User']),async(req,res)=>{
    const {description} = req.body
    const token = req.header('x-auth-token')
    let meantFor,userId,driverId = null

    // const {error} = validate(req.body)
    // if(error)
    // return res.status(400).send(error.details[0].message)
    try{
        const decoded = jwt.verify(token,config.get('driverPrivateKey'));
        if(req.user.isDriver){
            meantFor = 'User'
            driverId =req.user._id
            userId = req.body.userId
        }
        else{
            meantFor = 'Driver'
            userId = req.user._id
            driverId = req.body.driverId
        }
        const feedback = new Feedback({description,meantFor,userId,driverId})
        await feedback.save()
        return res.status(201).send(feedback)

    }catch(err){
        console.log(err)
        return res.status(500).send(err)
    }
})
module.exports = router