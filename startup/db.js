const mongoose = require('mongoose');


module.exports=function(){ mongoose.connect('mongodb://0.0.0.0/taxi')
.then(()=>{logger.info('connected to mongoDB')})
.catch((err)=>{logger.error(err.message)})};