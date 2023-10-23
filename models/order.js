const mongoose = require('mongoose');
const Joi = require('joi');

const orderSchema= mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    driverId:{
        type:String,
       // required:true,
    },
    taken:{
        type:Boolean,
        default:false
    },
    start:{
        type:[Number],
        default:[0,0]
    },
    end:{
        type:[Number],
        default:[0,0]
    },
    otp:{
        type:String,
    },
    createAt:{
        type:String,
    },
    startTime:{
        type:String,
    },
    endTime:{
        type:String,
    },
    cost:{
        type:Number
    }
    
});
const Order = mongoose.model('Order',orderSchema);

module.exports.Order=Order;

