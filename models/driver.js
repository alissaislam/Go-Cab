const mongoose = require('mongoose');
const Joi = require('joi');
const { string } = require('joi');
const jwt = require('jsonwebtoken');
const config=require('config');


const driverSchema= new mongoose.Schema({
image:
{
    name: String,
    data: Buffer,
    contentType: String
},
firstName:{
    required:true,
    type: String,
    minlingth:3,
    maxlingth:50
},
lastName:{
    required:true,
    type: String,
    minlingth:3,
    maxlingth:50
},
phone:{
    required:true,
    type: String,
    minlingth:10,
    maxlingth:50,
},
email:{
    required:false,
    type: String,
    minlingth:5,
    maxlingth:255
},
password:{
    required:false,
    type: String,
    minlingth:5,
    maxlingth:1024
},
carSpecifications:{
    
    
        company:{
            type:String,
            minlingth:3,
            maxlingth:55
        },
        color:{
            type:String,
            minlingth:3,
            maxlingth:55
        },
        carNumber:{
            type:String,
             minlingth:3,
            maxlingth:55
        },
        capacity:{
            default:'4',
            type:String,
            minlingth:1,
            maxlingth:2
        },
        class:{
            default:'economy',
            type:String,
            minlingth:3,
            maxlingth:55
        }
    
},
location:{
    type:Array,
    default:[0,0]
},

rating:{
    type:Number,
    min:0,
    max:5,
    default:0
},
ratingCount:{
    type:Number,
    default:0
},
isAvilable:{
    type:Boolean,
    default:true
},
fcmToken:{
    type:String,
},
wallet:{
    type:Number,
    default:0,
    min:0
},
socketId:{
    type:String,
},
points:{
    type:Number,
    min:0,
    default:0
}
});


driverSchema.methods.generateAuthToken= function (){
    const token= jwt.sign({_id: this._id,role:'Driver'},config.get('driverPrivateKey'));
    return token;
};

const Driver = mongoose.model('Driver',driverSchema);

function validatedriver(driver){
    const schema =Joi.object().keys({
        image: Joi.binary().min(1).allow('jpg', 'jpeg', 'png'),
        firstName:Joi.string().required().min(3).max(50),
        lastName:Joi.string().required().min(3).max(50),
        phone:Joi.string().required().min(10).max(50),
        email:Joi.string().email().required().min(5).max(255),
        password:Joi.string().required().min(5).max(255),
        company:Joi.string().required().min(3).max(50),
        color:Joi.string().required().min(3).max(50),
        carNumber:Joi.string().required().min(3).max(50),
        capacity:Joi.string().min(3).max(50),
        class:Joi.string().min(3).max(50),
       
    });
    
    return schema.validate(driver);
    
    };

    function updateValidatedriver(driver){
        const schema =Joi.object().keys({
            image: Joi.binary().min(1).allow('jpg', 'jpeg', 'png'),
            firstName:Joi.string().min(3).max(50),
            lastName:Joi.string().min(3).max(50),
            phone:Joi.string().min(10).max(50),
            company:Joi.string().min(3).max(50),
            color:Joi.string().min(3).max(50),
            carNumber:Joi.string().min(3).max(50),
            capacity:Joi.string().min(3).max(50),
            class:Joi.string().min(3).max(50),
           
        });
        
        return schema.validate(driver);
        
        };
        function validateDriverPhone(user){
            const Schema=
                Joi.object({
                    image: Joi.binary().min(1).allow('jpg', 'jpeg', 'png'),
                    firstName:Joi.string().required().min(3).max(50),
                    lastName:Joi.string().required().min(3).max(50),
                    phone:Joi.string().required().min(10).max(50),
                    email:Joi.string().email().min(5).max(255),
                    password:Joi.string().min(5).max(255),
                    company:Joi.string().min(3).max(50),
                    color:Joi.string().min(3).max(50),
                    carNumber:Joi.string().min(3).max(50),
                    capacity:Joi.string().min(1).max(2),
                    class:Joi.string().min(3).max(50),
                });
            return Schema.validate(user);
        }  

    module.exports.Driver= Driver;
    module.exports.validatedriver=validatedriver;
    module.exports.updateValidatedriver=updateValidatedriver;
    exports.validatePhone = validateDriverPhone;

    