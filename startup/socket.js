const { Driver } = require('../models/driver');
const { User } = require('../models/user');
const jwt= require('jsonwebtoken');
const config = require('config')


function setupSocket (io){

    io.use(function(socket, next){
    
      if (socket.handshake.headers.token){
  
        jwt.verify(socket.handshake.headers.token, config.get('driverPrivateKey'), function(err, decoded) {
          if (err) return next(new Error('Authentication error'));
          socket.decoded = decoded;
          next();
        });
      }
      else {
        next(new Error('Authentication error'));
      }    
    })
  
    .on("connection",async (socket)=>{
      try{
      logger.info('new connection')
      
      let user;
      if(socket.decoded.isDriver){
       user = await Driver.findById(socket.decoded._id)
       user.isAvilable=true
      }
       else{
       user = await User.findById(socket.decoded._id);
       }
      user.socketId=socket.id;
      await user.save();
      }
      catch(err){
        socket.emit('error',err.message)
       }
    })
    
}

exports.setupSocket=setupSocket