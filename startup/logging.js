const winston = require('winston');
const { createLogger, format, transports } =require('winston');



module.exports= function(){
    const logger = createLogger({
        level: 'info',
        format: format.json(),
        // defaultMeta: { service: 'user-service' },
        transports: [
          new transports.Console({
            level: 'info',
            format: format.combine(
              format.colorize(),
              format.simple()
            )
          }),
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logfile.log' }),
             
        ]
      });
      

       process.on('unhandledRejection',(ex)=>{
            throw ex;
            });
            
   
        winston.add(new winston.transports.File({filename:'uncaughtException.log'}));
      
    // winston.exceptions.handle(
        // new winston.transports.Console({colorize:true ,prettyPrint:true}),
        // new winston.transports.File({filename:'uncaughtException.log'}));

        //

        // const logger = winston.createLogger({
        //     level: 'info',
        //     format: winston.format.json(),
        //     defaultMeta: { service: 'user-service' },
        //     transports: [
              
        //       new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //       new winston.transports.File({ filename: 'logfile.log' }),
        //     ],
        //   });

         global.logger = logger;
};