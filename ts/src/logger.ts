import winston = require('winston');

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


let files = new winston.transports.File({ filename: "./logs/devel.log" });
let console = new winston.transports.Console(
  { level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
});
 
winston.add(console);
winston.add(files);

function isLogLvl(value:string):boolean {
    return config.levels.hasOwnProperty(value)
}
export function setLogLevel(value:string):void {
    if(!isLogLvl(value))
        throw `Unrecognized logLvel "${value}"`;
    //console.dir(logger.transports);
  //  winston.transports.level ((e) => e.level = value);
}

export {winston as logger};