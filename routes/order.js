const { Driver } = require('../models/driver');
const { pushNotificationWithMessage }= require('../models/notification');
const {Order} = require('../models/order');
const { User } = require('../models/user');
const otpGenerator = require('otp-generator');
const moment = require('moment');
const express = require('express');
const router = express.Router();

function orderSocket (io){
  io.on("connection",async (socket)=>{
    console.log(socket.id)
    socket.on('orderCreate',async (data)=>{
      try{
        let user =  await User.findById(socket.decoded._id);
        if(!user)
        user =  await Driver.findById(socket.decoded._id);
        if(!user.isAvilable){
          socket.emit('error',"you are already in a trip")
        }
        else{
      

        let drivers=await nearestDriver(
          data.Slatitude,
          data.Slongitude,
          data.capacity,
          data.class
          );

          if(drivers)

   {
    const order = new Order({
      userId:socket.decoded._id,
      'start.0':data.Slatitude,
      'start.1':data.Slongitude,
      'end.0':data.Elatitude,
      'end.1':data.Elongitude,
      createAt: moment().format('YYYY-MM-DD dddd HH:mm:ss')
    })
await order.save();

user.isAvilable=false
await user.save()
     for( i = 0 ; i < drivers.length ; i++ ){

      io.to(drivers[i].socketId).emit('newTrip',{"msg":"are you ready",'order':order,'user':user })
      io.sockets.sockets.get(drivers[i].socketId).join(`nearestDriversTo${order.id}`);
      
      const message = {
        notification: {
          title: "New Trip",
          body:"Are you ready!",
        },
        token: drivers[i].fcmToken,
        orderId:order.id
      };
      pushNotificationWithMessage(message);
    }
    socket.emit('orderCreated',{'orderId':order.id});
  }
  else{
socket.emit('error',{'msg':'no avilabile drivers'})
  }

  }
        } catch(err){
          socket.emit('error',err.message)
         }
     })

     //when a driver accept a trip
     socket.on('accept', async (data)=>{

try{

      const order_id = data.orderId; 
         const order = await Order.findById(order_id)
         if(!order)
         socket.emit('error','order not found')
         else
         if(order.taken)
         socket.emit('error','sorry trip already taken')
      
         else{
        
         order.taken=true;
         order.driverId=socket.decoded._id
         await order.save();
         let user =  await User.findById(order.userId);
         if(!user)
         user =  await Driver.findById(order.userId);
      
        socket.to(`nearestDriversTo${order.id}`).emit('orderTaken' , 'the trip has been taken')
        io.socketsLeave(`nearestDriversTo${order.id}`);

        const driver =await Driver.findById(socket.decoded._id).select({firstName:1,lastName:1,phone:1,image:1,isAvilable:1})
        driver.isAvilable= false
        await driver.save()
        io.to(user.socketId).emit('driverFound',{"msg":'Your driver is on the way','driver':driver})
         
         const message = {
          notification: {
            title: "your taxi is on the way!",
            body: "",
          },
          token: user.fcmToken,
        };
      
         pushNotificationWithMessage(message);
        }
      }
      
      catch(err){
       socket.emit('error',err.message)
      }

     })

     //when driver arrived
     socket.on('arrived',async (data)=>{
      try{
      const order_id = data.orderId; 
      const order = await Order.findById(order_id);
      if(!order)
         return socket.emit('error','order not found')
         else{
      const driver = await Driver.findById(order.driverId)
      
      if(socket.id === driver.socketId ){
        if(order.otp){
          socket.emit('error','already arrived')
        }
        else{
       //send otp to the driver and user
    const otp= otpGenerator.generate(6);
   
    order.otp=otp
    await order.save();

    socket.emit('otp',{'otp':otp})
    let user = await User.findById(order.userId);
    if(!user)
      user =  await Driver.findById(order.userId);

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
     socket.on('VerificationOtp',async(data)=>{
      try{
      const order =await Order.findById(data.orderId)
      if(!order)
         return socket.emit('error','order not found')
         else
      if(order.startTime){
        socket.emit('error',{'msg':'this trip is alredy started'})
      }
      else{
      if(order.otp===data.otp)
      {
        const driver = await Driver.findById(order.driverId)
        socket.emit('otpVerification',{'result':true})
        io.to(driver.socketId).emit('otpVerification',{'result':true})
        order.startTime=moment().format('YYYY-MM-DD dddd HH:mm:ss')
        await order.save()
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

  socket.on('end',async (data)=>{
    try{
    const order =await Order.findById(data.orderId)
    if(!order)
    return socket.emit('error','order not found')
    else
    if(order.startTime){
    if(!order.cost){
    order.cost=data.cost
    order.endTime=moment().format('YYYY-MM-DD dddd HH:mm:ss')
    await order.save()
    const driver =  await Driver.findById(order.driverId);
    driver.isAvilable=true
    await driver.save()
    let user =  await User.findById(order.userId);
    if(!user)
    user =  await Driver.findById(order.userId);
    user.isAvilable=true
    user.points=user.points+0.5
    io.to(user.socketId).emit('tripEnd',{'msg':"good bye!"})
    if(user.wallet<order.cost){
      return socket.emit('error','Insufficient balance, pay cash!.')
    }else{
      user.wallet-=order.cost
      driver.wallet+=order.cost
    }

    await driver.save()
    await user.save()
  }
  else{
    socket.emit('error',{'msg':'order is already ended'})
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

  socket.on('cancel',async (data)=>{
    const order = await Order.findById(data.orderId)
    if(!order)
         return socket.emit('error','order not found')
         else
    if(order.startTime)
    socket.emit('error',{'msg':"you can't cancel the order" })
    else
    if(order.driverId){
      const driver = await Driver.findById(order.driverId)
      io.to(driver.socketId).emit('orderCanceled',{'msg':'order canceled'})
      driver.isAvilable=true
      await driver.save()
      let user =  await User.findById(order.userId);
      if(!user)
      user =  await Driver.findById(order.userId);
      user.isAvilable=true
      await user.save()
    }
    else{
      io.to(`nearestDriversTo${order.id}`).emit('orderCanceled',{'msg':'order canceled'})
      let user =  await User.findById(order.userId);
      if(!user)
      user =  await Driver.findById(order.userId);
      user.isAvilable=true
      await user.save()
      await Order.findByIdAndRemove(order.id)
    }
  })
  socket.on('driverLocation',async (data)=>{
    const driver= await Driver.findById(socket.decoded._id)
    driver.location=data.location
    await driver.save()

  })

  socket.on("disconnect", async (reason) => {
    try{
    if(socket.decoded.role == 'Driver'){
      const driver = await Driver.findById(socket.decoded._id)
      driver.isAvilable=false
      await driver.save()
    }
  }
  catch(err){
    socket.emit('error',err.message)
   }
  });

  socket.on("rating",async(data)=>{
    try{
      const order = await Order.findById(data.orderId)
      if(!order)
      return socket.emit("error",{"msg":"Order not found."})
      console.log(order.DriverId)
      const driver = await Driver.findById(order.driverId)
      if(!driver)
      return socket.emit("error",{"msg":"Driver not found."})

      
      driver.rating = (driver.rating+data.rating)/(driver.ratingCount+1)
      driver.ratingCount++
      await driver.save()
    }catch(err){
      socket.emit('error',err.message)
    }
  })

   })
  
}

  async function  nearestDriver (latitude,longitude,capacity,clas)
  {
    try{
    const coordinates=[latitude,longitude];
    let drivers = await Driver.find({
      "carSpecifications.class": clas ,
      "carSpecifications.capacity": capacity ,
      isAvilable:true,
      location: {
        $geoWithin:{
          $centerSphere:[coordinates,3/3963.2]
      }
    }
     }).select({fcmToken:1,socketId:1});

     return drivers;
    }
    catch(err){
      console.log(err.message)
     }
  }
  module.exports.orderSocket = orderSocket
  
  
