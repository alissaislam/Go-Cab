const { map } = require('lodash');
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    fcmToken:{
        type:String,
    },
    socketId:{
        type:String,
    }
})
const driverSchema = new mongoose.Schema({
    fcmToken:{
        type:String,
    },
    socketId:{
        type:String,
    }
})
const poolTaxiSchema= mongoose.Schema({
    usersId:{
        type:[String],
    },
    driverId:{
        type:String,
    },
    taken:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String,
    },
    passengersCount:{
        type:Number,
        default:1
    },
    totalPassengers:{
        type:Number,
        required:true
    },
    start:{
        type:[Number],
        default:[0,0]
    },
    end:{
        type:[Number],
        default:[0,0]
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
    },
    locations:{
        type:Map,
        of:[String]
    }
});
const PoolTaxi = mongoose.model('PoolTaxi',poolTaxiSchema);

module.exports.PoolTaxi=PoolTaxi;

