const driver =require('../routes/driver');
const auth =require('../routes/auth');
const express = require('express');
const location= require('../routes/location');
const user= require('../routes/users');
const notification= require('../routes/notification');
const order= require('../routes/order');
const admin =require('../routes/admin')
const feedback = require('../routes/feedback')
const car= require('../routes/car');
const prestigeRent= require('../routes/PrestigeRent');
const poolTaxi= require('../routes/poolTaxi');
const socket = require('./socket')
const orders = require('../routes/orders')
const authRoutes = require('../routes/google/google-auth-routes')
const profileRoutes = require('../routes/google/google-profile-routes')

module.exports=function(app,io){
    socket.setupSocket(io)
    order.orderSocket(io);
    poolTaxi.poolSocket(io);
    prestigeRent.prestigeRentSocket(io);
    app.use(express.json());
    app.use('/api/drivers',driver);
    app.use('/api/auth',auth);
    app.use('/api/location',location);
    app.use('/api/users',user);
    app.use('/api/cars', car);
    app.use('/api/prestigeRents', prestigeRent);
    //app.use('/api/poolTaxi',poolTaxi.router);
    app.use('/api/orders',orders)
    app.use('/auth',authRoutes);
    app.use('/profile',profileRoutes) ;  
    app.use('/admin',admin)
    app.use('/feedback',feedback)
    // app.use(error);
    app.use('/api/notification',notification);
    //app.use('/api/order',order.router);
   // app.use(error);

};