const express = require('express');
const { Car } = require('../models/car');
const { PrestigeRent, validatePrestigeRent } = require('../models/PrestigeRent');
const { Driver } = require('../models/driver');
const router= express.Router();
const schedule = require('node-schedule');
const { User } = require('../models/user');
const otpGenerator = require('otp-generator');
const moment = require('moment');
const { pushNotificationWithMessage} = require('../models/notification');

router.get('/getCar/:id', async (req,res)=>{
try{
    
   const car = await Car.findById(req.params.id)
   const rented  = await PrestigeRent.find({carId:req.params.id}).select({startTime:1})
   const result = {car,rented}
   res.send(result)
} 
catch(err){
    res.status(500).send(err.message)
}
});



// let usersIds=[]
 
function prestigeRentSocket(io){
    
      
      io.on("connection",async (socket)=>{
        
    socket.on('orderingPrestigeRent',async (data)=>{
        try{
            const taken = await PrestigeRent.findOne({carId:data.carId,reservationDate:data.reservationDate})
            if( taken ) 
            socket.emit ('error',{'msg': 'car is not available on this date'} )
            else{
              data.reservationDate= new Date(data.reservationDate).toISOString().split('T')[0]
              const {error} = validatePrestigeRent(data);
              if(error){
                socket.emit('error',{'msg':error.details[0].message})
              }
              else{
                const prestigeRent = new PrestigeRent({
                    userId:socket.decoded._id,
                    carId:data.carId,
                    'start.0':data.latitude,
                    'start.1':data.longitude,
                    reservationDate:data.reservationDate
                })
                await prestigeRent.save()
                 
                const drivers = await Driver.find({"carSpecifications.carNumber":{ $eq: null },isAvilable:true})
                 drivers.forEach(function(driver){
                 io.to(driver.socketId).emit('prestigeRentOrder',{'prestigeRent':prestigeRent})
                })
              }
            }
        }
            catch(err){
              socket.emit('error',err.message)
            }
    })
    socket.on('acceptPrestigeRent',async (data)=>{
        const prestigeRent = await PrestigeRent.findById(data.prestigeRentId)

        if(prestigeRent.driverId)
        socket.emit('error',{'msg':'order already taken'})
    else{
        const driverNotAvailable = await PrestigeRent.findOne({driverId:socket.decoded._id,reservationDate:prestigeRent.reservationDate})
        if(driverNotAvailable)
        socket.emit('error',{'msg':'you already have prestige rent in the same date'})
    else{
        prestigeRent.driverId = socket.decoded._id
        await prestigeRent.save()
        const user = await User.findById(prestigeRent.userId)
        const message = {
          notification: {
            title: "new prestige ",
            body: "are you ready",
          
          },
          token: user.fcmToken,
        };
       pushNotificationWithMessage(message);
      }
        
    }
    })  
    //when driver arrived
    socket.on('arrivedPrestigeRent',async (data)=>{
        try{
        const prestigeRent_id = data.prestigeRentId; 
        const prestigeRent = await PrestigeRent.findById(prestigeRent_id);
        if(!prestigeRent)
           return socket.emit('error','prestigeRent not found')
           else{
        const driver = await Driver.findById(prestigeRent.driverId)
        
        if(socket.id === driver.socketId ){
          if(prestigeRent.otp){
            socket.emit('error','already arrived')
          }
          else{
         //send otp to the driver and user
      const otp= otpGenerator.generate(6);
     
      prestigeRent.otp=otp
      await prestigeRent.save();
  
      socket.emit('otp',{'otp':otp})
      let user = await User.findById(prestigeRent.userId);
      if(!user)
        user =  await Driver.findById(prestigeRent.userId);
  
      io.to(user.socketId).emit('driverArrived','please scan QR')
  
        const message = {
          notification: {
            title: "lets go",
            body: "your driver is here",
          
          },
          token: user.fcmToken,
        };
       pushNotificationWithMessage(message);
      }
      }
      else{
      socket.emit('error',{'msg':'this trip is taken by someone else'})
      }
    }
  }
    catch(err){
      socket.emit('error',err.message)
     }
       })
       //when user send otp for Verification
       socket.on('VerificationOtpPrestigeRent',async(data)=>{
        try{
        const prestigeRent =await PrestigeRent.findById(data.prestigeRentId)
        if(!prestigeRent)
           return socket.emit('error','prestigeRent not found')
           else
        if(prestigeRent.startTime){
          socket.emit('error',{'msg':'this trip is alredy started'})
        }
        else{
        if(prestigeRent.otp===data.otp)
        {
          const driver = await Driver.findById(prestigeRent.driverId)
          socket.emit('otpVerification',{'result':true})
          io.to(driver.socketId).emit('otpVerification',{'result':true})
          prestigeRent.startTime=moment().format('YYYY-MM-DD dddd HH:mm:ss')
          await prestigeRent.save()
        }
        else
        {
          socket.emit('error',{'msg':'wrong QR'})
          io.to(driver.socketId).emit('error',{'msg':'wrong QR'})
        }
      }
    }
    catch(err){
      socket.emit('error',err.message)
     }
    })
  
    socket.on('endPrestigeRent',async (data)=>{
      try{
      const prestigeRent =await PrestigeRent.findById(data.prestigeRentId)
      if(!prestigeRent)
      return socket.emit('error','prestigeRent not found')
      else
      if(prestigeRent.startTime){
      if(!prestigeRent.cost){
      prestigeRent.cost=data.cost
      await prestigeRent.save()
      const user = await User.findById(prestigeRent.userId)
      const message = {
        notification: {
          title: "trip end ",
          body: "good bye",
        
        },
        token: user.fcmToken,
      };
     pushNotificationWithMessage(message);
    }
    else{
      socket.emit('error',{'msg':'prestigeRent is already ended'})
    }
  }
  else{
    socket.emit('error',{'msg':'you must start the trip first'})
  }
      }
      catch(err){
        socket.emit('error',err.message)
       }
    })
  
    socket.on('cancelPrestigeRent',async (data)=>{

      const prestigeRent = await PrestigeRent.findById(data.prestigeRentId)
      const today = new Date();
      if(prestigeRent.reservationDate === today.toISOString().split("T")[0])
      socket.emit('error',{'msg':"you can't cancel the rent now!"})
    else{
        if(prestigeRent.driverId){
            const driver = await Driver.findById(prestigeRent.driverId)
            io.to(driver.socketId).emit('prestigeRentCanceled',{'msg':'prestige Rent Canceled '})
        }
    }
      
   })    
   const job = schedule.scheduleJob('0 0 * * *', async function() {
    
    const today = new Date();
    const prestigeRentsWithoutDriver = await PrestigeRent.find({reservationDate:today.toISOString().split("T")[0],driverId:{$eq: null }})
    prestigeRentsWithoutDriver.forEach(async function(prestigeRent){
        let user = await User.findById(prestigeRent.userId)
        if(!user)
        user = await Driver.findById(prestigeRent.userId)
        io.to(user.socketId).emit('prestigeError',{'msg':"your prestige rent is without driver"})
    })

    const prestigeRents = await PrestigeRent.find({reservationDate:today.toISOString().split("T")[0], driverId:{$ne:null}})
    
    prestigeRents.forEach(async function(prestigeRent){
        let user = await User.findById(prestigeRent.userId)
        if(!user)
        user = await Driver.findById(prestigeRent.userId)
        io.to(user.socketId).emit('todayIsYourPrestigeRent',{'prestigeRent':prestigeRent})
        const driver = await Driver.findById(prestigeRent.driverId)
        io.to(driver.socketId).emit('0',{'prestigeRent':prestigeRent})
    })
    
 }); 
})
}

module.exports=router;
module.exports.prestigeRentSocket=prestigeRentSocket
