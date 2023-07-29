const config = require('config')
module.exports = function(){
    if(!config.get('driverPrivateKey')){
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined.')
    }
}