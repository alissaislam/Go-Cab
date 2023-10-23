const express =require('express')
const router = express.Router()
const {User} = require('../models/user')
const {Driver} = require('../models/driver')
const {Order} = require('../models/order')
//payment after finishing the trip
router.put('/payment',auth(['User']),async (req,res)=>{
    try{// put in orders
    const tripPrice = 500
    const order = await Order.find({userId:req.user._id})
    const user = await User.find({_id:order.userId})
    const driver = await Driver.find({_id:order.driverId})
    if(user.wallet<tripPrice)
    return res.status(400).send('Insufficient Balance! Pay cash.')
    user.wallet-=tripPrice
    driver.wallet+=tripPrice
    await user.save()
    await driver.save()
    return res.send(`Payment success, Your balance is: ${user.wallet}`)
    }catch(ex){
      console.log(ex)
      return res.status(500).send(ex)
    }
  })
//rate the driver after finishing the trip
  router.put('/rating',auth(['User']),async(req,res)=>{
    const rating = req.body.rating
    try{
      const order = await Order.find({userId:req.user._id})
      const driver = await Driver.find({_id:order.driverId})
      const ratingCount = driver.ratingCount+1
      driver.rating = rating/ratingCount
      driver.ratingCount++
      await driver.save()
      return res.send('Success.')
    }catch(ex){
      console.log(ex)
      return res.status(500).send(ex)
    }
  })

  //get all orders for a specific user
  router.get('/getOrders',auth(['Driver','User']),async (req,res)=>{
    try{
        let user
        user = await User.findById(req.user._id)
        if(!user)
        user = await Driver.findById(req.user._id)
        if(!user)
        return res.status(400).send('User not found.')
        const order = await Order.findOne({userId:user._id})
        if(!order){
          return res.send(`You haven't ordered any rides yet.`)
        }
        return res.send(order)
        
    }catch(err){
        console.log(err)
      return res.status(500).send(err)
    }
  })
  //get all orders that a driver had delivered
  router.get('/getRides',auth(['Driver']),async(req,res)=>{
    try{
      let driver
      driver = await Driver.findById(req.user._id)
      if(!driver)
      return res.status(400).send('User not found.')
      const order = await Order.findOne({driverId:driver._id})
      if(!order){
        return res.send(`You haven't delivered any rides yet.`)
      }
      return res.send(order)
      
  }catch(err){
      console.log(err)
    return res.status(500).send(err)
  }
  })
  module.exports = router