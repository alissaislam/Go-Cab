const jwt = require('jsonwebtoken');
const config=require('config'); 
 
 
//  function auth(req,res,next){
//     const token = req.header('x-auth-token');
//     if (!token)
//      return res.status(401).send('Access denied, no token');

//      try{
//      const decoded = jwt.verify(token,config.get('driverPrivateKey'));
//      req.user=decoded;
//      next();
//      }
//      catch(ex){
//         return res.status(403).send('Invalid Token');
//      }
// };
module.exports.auth = auth= (roles)=>{
   return (req,res,next)=>{
      const token = req.header('x-auth-token');
    if (!token)
     return res.status(401).send('Access denied, no token');

     try{
     const decoded = jwt.verify(token,config.get('driverPrivateKey'));
     if(roles.includes(decoded.role)){
      req.user=decoded;
      next();
     }else{
         return res.status(403).send('Invalid Token');
     }
     }
     catch(ex){
        return res.status(403).send('Invalid Token');
     }
   }
}


//google Auth Check
function authCheck(req,res,next){
   if(!req.user){
      //user not logged in
      res.redirect('/auth/login')
   } else {
      //logged in
      next()
   }
}

module.exports.authCheck=authCheck
// module.exports.auth=auth
