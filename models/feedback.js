const mongoose = require('mongoose')
const Joi = require('joi')

const feedbackSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        minlength:5,
        maxlength:1024
    },
    meantFor:{
        type:String,
        required:true
    },
    driverId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    }
})
const Feedback = mongoose.model('Feedback',feedbackSchema)

exports.Feedback=Feedback