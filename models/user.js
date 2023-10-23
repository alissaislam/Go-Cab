const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config')
const Joi = require('joi');
const userSchema = new mongoose.Schema({
    googleId:String,
    username:String,
    first_name:{
        type:String,
        required:true,
        minlength:3,
        maxlength:55
    },
    last_name:{
        type:String,
        required:true,
        minlength:2,
        maxlength:55
    },
    email:{
        type:String,
        minlingth:5,
        maxlingth:255,
    },
    password:{
        type:String,
        required:false,
        minlength:8,
        maxlength:1024
        },
    phone:{
        type:String,
        minlength:5,
        maxlength:50
    },
    image:{
        name:String,
        data:Buffer,
        contentType:String
    },
    points:{
        type:Number,
        min:0,
        default:0
    },
    wallet:{
        type:Number,
        default:0,
        min:0
    },
    fcmToken:{
        type:String,
    },
    socketId:{
        type:String,
    },
    isAvilable:{
        type:Boolean,
        default:true
    }
});
userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id,role:'User'},config.get('driverPrivateKey'));
    return token
}
const User  = mongoose.model('User',userSchema);

function validateUser(user){
    const Schema=
        Joi.object({
            first_name:Joi.string().required().min(3).max(55),
            last_name:Joi.string().required().min(2 ).max(55),
            email:Joi.string().email().required(),
            password:Joi.string().min(8).max(1024).required(),
            phone:Joi.string().min(5).max(50).required(),
            image:Joi.any()
        });
    return Schema.validate(user);
} 
function validateUserPhone(user){
    const Schema=
        Joi.object({
            first_name:Joi.string().required().min(3).max(55),
            last_name:Joi.string().required().min(2 ).max(55),
            email:Joi.string().email(),
            password:Joi.string().min(8).max(1024),
            phone:Joi.string().min(5).max(50).required(),
            image:Joi.any()
        });
    return Schema.validate(user);
}  
exports.User = User;
exports.validatePhone = validateUserPhone;
exports.validate = validateUser;