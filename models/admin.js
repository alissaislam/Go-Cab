const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config  = require('config')
const { string, number } = require('joi')
const Joi = require('joi')
const adminSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true,
        minlength:3,
        maxlength:55
    },
    last_name:{
        type:String,
        required:true,
        minlength:3,
        maxlength:55
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:1024
    },
    phone:{
        type:String,
        minlength:5,
        maxlength:50
    },
    salary:{
        type:Number,
        min:0
    }
})
adminSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id,role:'Admin'},config.get('driverPrivateKey'));
    return token
}
const Admin = mongoose.model('Admin',adminSchema)

function validateAdmin(admin){
    const Schema=
        Joi.object({
            first_name:Joi.string().required().min(3).max(55),
            last_name:Joi.string().required().min(3).max(55),
            email:Joi.string().email().required(),
            password:Joi.string().min(8).max(1024),
            phone:Joi.string().min(5).max(50),
        });
    return Schema.validate(admin);
}   

exports.validate = validateAdmin
exports.Admin = Admin