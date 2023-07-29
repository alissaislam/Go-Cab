const {PoolTaxi} = require('../models/poolTaxi');
const { Driver } = require('../models/driver');
const { pushNotificationWithMessage}= require('../models/notification');
const { User } = require('../models/user');
const otpGenerator = require('otp-generator');
const moment = require('moment');

function poolSocket (io){

  io.on("connection",async (socket)=>{
   //when user ordering
    socket.on('poolRequest',async (data)=>{
      try{
        let user =  await User.findById(socket.decoded._id);
        if(!user)
        user =  await Driver.findById(socket.decoded._id);
        if(!user.isAvilable){
          socket.emit('error',"you are already in a trip")
        }
        else{
        //found
        const start=[data.Slatitude,data.Slongitude]
        const end = [data.Elatitude,data.Elongitude]
        let pool = await PoolTaxi.findOne({
          start:{
                    $geoWithin:{
                      $centerSphere:[start,1/3963.2]
                  }
                },
                end:{
                  $geoWithin:{
                    $centerSphere:[end,1/3963.2]
                }
             },
             $expr: {
              $lt: ['$passengersCount', '$totalPassengers']
            }

        })
        user.isAvilable=false
          await user.save()
        if(pool){
          
          pool.passengersCount +=1;
          socket.emit('poolFound',{"msg":"you have joined a pool!",'pool':pool })
          socket.join(`passengersFor${pool.id}`);
          socket.to(`passengersFor${pool.id}`).emit('someOneIn',{'msg':'some one joined'})
          pool.usersId.forEach(async id => {
            let user= await User.findById(id)
            if(!user)
            user =  await Driver.findById(id)
            const message = {
              notification: {
                title: "pool info",
                body: "some one joined the pool!",
               },
              token: user.fcmToken,
              };
             pushNotificationWithMessage(message)
          });

          
          pool.usersId.push(user.id)
          await pool.save()

          if( pool.totalPassengers === pool.passengersCount ){
              
            pool.usersId.forEach(async id => {
              let user= await User.findById(id)
              if(!user)
              user =  await Driver.findById(id)
              const message = {
                notification: {
                  title: "looking for a driver",
                  body: "lets goo!",
                 },
                token: user.fcmToken,
                };
               pushNotificationWithMessage(message)
            });
            io.to(`passengersFor${pool.id}`).emit('poolComplete',{'msg':"looking for a driver"})
          
                let drivers=await nearestDriver(
                  pool.start[0],
                  pool.start[1],
                  );
            
            for( i = 0 ; i < drivers.length ; i++ ){
        
              io.to(drivers[i].socketId).emit('newPool',{"msg":"are you ready",'pool':pool })
              io.sockets.sockets.get(drivers[i].socketId).join(`nearestDriversTo${pool.id}`)
              
              const message = {
                notification: {
                  title: "New Pool",
                  body:"Are you ready!",
                },
                token: drivers[i].fcmToken,
              };
             pushNotificationWithMessage(message);
            }
 
            }
          }
          else{
            const pool = new PoolTaxi({
              'usersId.0':socket.decoded._id,
              'start.0':data.Slatitude,
              'start.1':data.Slongitude,
              'end.0':data.Elatitude,
              'end.1':data.Elongitude,
              totalPassengers:data.totalPassengers,
              createAt: moment().format('YYYY-MM-DD dddd HH:mm:ss')
            })
            await pool.save()
            socket.join(`passengersFor${pool.id}`);
            socket.emit('poolCreated',{'pool':pool})
            if(socket.decoded.isDriver){
              await Driver.findByIdAndUpdate(socket.decoded._id,{
                              $set:{
                                  isAvilable:false
                              }
                            })
                  }
            
          }
        }
        } catch(err){
          socket.emit('error',err.message)
         }
     })

     //when a driver accept a trip
     socket.on('acceptPool', async (data)=>{

try{

        const pool_id = data.poolId; 
         const pool = await PoolTaxi.findById(pool_id)
         if(!pool)
         return socket.emit('error','pool not found')
         if(pool.taken)
         socket.emit('error','sorry pool already taken')
      
         else{
        
         pool.taken=true;
         pool.driverId=socket.decoded._id
         await pool.save();
         
      
        socket.to(`nearestDriversTo${pool.id}`).emit('orderTaken' , 'the trip has been taken')
        io.socketsLeave(`nearestDriversTo${pool.id}`);

        const driver =await Driver.findById(socket.decoded._id).select({firstName:1,lastName:1,phone:1,image:1,isAvilable:1})
        driver.isAvilable= false
        await driver.save()

        pool.usersId.forEach(async id => {
          let user= await User.findById(id)
          if(!user)
          user =  await Driver.findById(id)
          const message = {
            notification: {
              title: "driver found",
              body: "let's goo!",
             },
            token: user.fcmToken,
            };
           pushNotificationWithMessage(message)
        });
        io.to(`passengersFor${pool.id}`).emit('driverFound',{"msg":'Your driver is on the way','driver':driver})
         
        }
      }
      catch(err){
       socket.emit('error',err.message)
      }

     })

     //when driver arrived
     socket.on('arrivedPool',async (data)=>{
      try{
      const pool_id = data.poolId; 
      const pool = await PoolTaxi.findById(pool_id);
      if(!pool)
         return socket.emit('error','pool not found')
         else{
      const driver = await Driver.findById(pool.driverId)
      
      if(socket.id === driver.socketId ){
        if(pool.otp){
          socket.emit('error','already arrived')
        }
        else{
       //send otp to the driver and user
    const otp= otpGenerator.generate(6);
   
    pool.otp=otp
    await pool.save();

    socket.emit('otp',{'otp':otp})
    pool.usersId.forEach(async id => {
      let user= await User.findById(id)
      if(!user)
      user =  await Driver.findById(id)
      const message = {
        notification: {
          title: "lets go",
          body: "your driver is here",
        
        },
        token: user.fcmToken,
        };
       pushNotificationWithMessage(message)
    });

    io.to(`passengersFor${pool.id}`).emit('driverArrived','please scan QR')
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
//      //when user send otp for Verification
     socket.on('VerificationOtpPool',async(data)=>{
      try{
      const pool =await PoolTaxi.findById(data.poolId)
      if(!pool)
         return socket.emit('error','pool not found')
     else
      if(pool.startTime){
        socket.emit('error',{'msg':'this trip is alredy started'})
      }
      else{
      if(pool.otp===data.otp)
      {
        const driver = await Driver.findById(pool.driverId)
        io.to(`passengersFor${pool.id}`).emit('otpVerification',{'result':true})
        io.to(driver.socketId).emit('otpVerification',{'result':true})
        pool.startTime = moment().format('YYYY-MM-DD dddd HH:mm:ss')
        await pool.save()
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

  socket.on('endPool',async (data)=>{
    try{
    const pool =await PoolTaxi.findById(data.poolId)
    if(!pool)
     socket.emit('error','pool not found')
     else
    if(pool.startTime){
    if(!pool.cost){
    pool.cost=data.cost
    pool.endTime=moment().format('YYYY-MM-DD dddd HH:mm:ss')
    await pool.save()
    const driver =  await Driver.findById(pool.driverId);
    driver.isAvilable=true
    await driver.save()
    pool.usersId.forEach(async id => {
      let user= await User.findById(id)
      if(!user)
      user =  await Driver.findById(id)
      user.isAvilable=true
      await user.save()
    });
    io.to(`passengersFor${pool.id}`).emit('poolFinished',{'msg':'good bye!'})
  }
  else{
    socket.emit('error',{'msg':'pool is already ended'})
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

  socket.on('leave',async (data)=>{

    const pool = await PoolTaxi.findById(data.poolId)
    if(!pool)
    socket.emit('error',{'msg':"pool not found" })
    else
    if(pool.startTime)
    socket.emit('error',{'msg':"you can't leave the pool" })
    else
    if(pool.driverId){
      socket.emit('error',{'msg':"you can't leave the pool" })
    }
    else{
      io.to(`passengersFor${pool.id}`).emit('someoneLeft',{'msg':'someone left'})
      if(pool.passengersCount === pool.totalPassengers){
      io.to(`nearestDriversTo${pool.id}`).emit('someoneLeft',{'msg':'someone left'})
      }
      let user= await User.findById(socket.decoded._id)
      if(!user)
      user =  await Driver.findById(socket.decoded._id)
      const index = pool.usersId.indexOf(user.id)
      if (index !== -1) {
        pool.usersId.splice(index, 1);
      }
      pool.passengersCount-=1
      user.isAvilable=true
      await user.save()
      if(pool.passengersCount === 0)
      await PoolTaxi.findByIdAndRemove(pool.id)
      else
      await pool.save()
    }
  })

  socket.on("disconnect", async (reason) => {
    try{
    if(socket.decoded.isDriver){
      const driver = await Driver.findById(socket.decoded._id)
      driver.isAvilable=false
      await driver.save()
    }
  }
  catch(err){
    socket.emit('error',err.message)
   }
  });

   })
  
}

  async function  nearestDriver (latitude,longitude)
  {
    try{
    const coordinates=[latitude,longitude];
    let drivers = await Driver.find({
      "carSpecifications.class": 'economy' ,
      "carSpecifications.capacity": '4' ,
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
  module.exports.poolSocket=poolSocket;