const express = require('express');
const socketIO = require('socket.io')
const app = express();
const http = require('http');
const { Driver } = require('./models/driver');
const server = http.createServer(app)
const io = socketIO(server, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true
    }
  })

// app.get('/',(req,res)=>{
//     res.render('home',{user:req.user})
// })
//app.set('view engine','ejs')
require('express-async-errors');
require('./startup/logging')();
require('./startup/db')();
require('./startup/routes')(app,io);
require('./startup/config')();
// io.on('connection',(client)=>{
//     console.log('new connection')
//     console.log(client.id)
//   })
// io.on("connection",(client)=>{
//         logger.info('new connection')
//         logger.info(client.id)
//        })


const port = process.env.PORT || 3000;
server.listen(3000,async()=>{ 
    logger.info(`Listening on port ${port}....`)

    const drivers = await Driver.find()
    drivers.forEach( async function(driver){
        driver.isAvilable=false
        await driver.save()
    })
});      

module.exports.io=io;