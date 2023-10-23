const mongoose = require('mongoose');
const Joi = require('joi');
const JoiObjectId = require('joi-objectid')(Joi);

const prestigeSchema =new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    driverId:{
        type:String,
    },
    carId:{
        type:String,
        required:true,
    },
    start:{
        type:[Number],
        default:[0,0]
    },
    otp:{
        type:String,
    },
    createAt:{
        type:String,
    },
    reservationDate:{
        type:String,
    },
    startTime:{
        type:String,
    },
    cost:{
        type:Number
    }
})

const PrestigeRent = mongoose.model('PrestigeRent',prestigeSchema)

function validatePrestigeRent(prestigeRent){
    const Schema=
        Joi.object({
            carId:JoiObjectId().required(),
            latitude:Joi.number(),
            longitude:Joi.number(),
            reservationDate:Joi.date()
            .iso()
            .min('now')
            .required()
        });
    return Schema.validate(prestigeRent);
}

module.exports.PrestigeRent = PrestigeRent
module.exports.validatePrestigeRent=validatePrestigeRent
