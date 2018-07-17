import winston = require('winston');
//var Loggly = require('winston-loggly').Loggly;
//var loggly_options={ subdomain: "mysubdomain", inputToken: "efake000-000d-000e-a000-xfakee000a00" }
//logger.add(Loggly, loggly_options);
//logger.add(logger.transports.File, { filename: "./logs/production.log" });
//logger.info('Chill Winston, the logs are being captured 2 ways');
//module.exports=logger;


const config = {
    levels: {
      error: 0,
      debug: 1,
      warn: 2,
      data: 3,
      info: 4,
      verbose: 5,
      silly: 6,
      custom: 7
    },
    colors: {
      error: 'red',
      debug: 'blue',
      warn: 'yellow',
      data: 'grey',
      info: 'green',
      verbose: 'cyan',
      silly: 'magenta',
      custom: 'yellow'
    }
  };
  
  winston.addColors(config.colors);

  winston.remove(winston.transports.Console);
  winston.add(new winston.transports.Console({ 
    level: 'debug',
    format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize()
  ) }));


winston.add(new winston.transports.File ({ filename: "./logs/devel.log" }));

function isLogLvl(value:string):boolean {
    return config.levels.hasOwnProperty(value)
}
export function setLogLevel(value:string):void {
    if(!isLogLvl(value))
        throw `Unrecognized logLvel "${value}"`;
    winston.level = value;
}

export {winston as logger};