const mongoose = require('mongoose');
const Joi = require('joi');

const carSchema = new mongoose.Schema({
    image:
{
    name: String,
    data: Buffer,
    contentType: String
},
company:{
    type:String,
    required:true,
    minlingth:3,
    maxlingth:55
},
color:{
    type:String,
    required:true,
    minlingth:3,
    maxlingth:55
},
carNumber:{
    required:true,
    type:String,
     minlingth:3,
    maxlingth:55
},
cost:{
    type:Number,
    required:true,
}
})

const Car = mongoose.model('Car',carSchema);

function validateCar(car){
    const schema = Joi.object().keys({
        image : Joi.binary().min(1).allow('jpg', 'jpeg', 'png'),
        company:Joi.string().required().min(3).max(50),
        color:Joi.string().required().min(3).max(50),
        carNumber:Joi.string().required().min(3).max(50),
        cost : Joi.number().required().min(0),
    })
    return schema.validate(car);
}
function validateUpdateCar(car){
    const schema = Joi.object().keys({
        image : Joi.binary().min(1).allow('jpg', 'jpeg', 'png'),
        company:Joi.string().min(3).max(50),
        color:Joi.string().min(3).max(50),
        carNumber:Joi.string().min(3).max(50),
        cost : Joi.number().min(0),
    })
    return schema.validate(car);
}

exports.Car = Car 
exports.validateCar=validateCar
exports.validateUpdateCar=validateUpdateCar