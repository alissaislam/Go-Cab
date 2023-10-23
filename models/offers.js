const mongoose = require('mongoose')
const joi = require('joi')
const offerSchema = mongoose.Schema({
    description:{
        type:String,
        required:true
    },  
})