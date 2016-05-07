var winston = require('winston');
var path = require('path');
var util = require('util');
var fs = require('fs'); 
var logPath = "./logs";  

if(!fs.existsSync(logPath)){  
    fs.mkdirSync(logPath);    
};  

exports.config  = function (fileName) {
    var logger = new (winston.Logger)({  
        transports: [
          new (winston.transports.Console)({ level: 'info' }),
          new (winston.transports.DailyRotateFile)({   
            filename: util.format('%s/%s', logPath, fileName),  
            datePattern: '-yyyy-MM-dd.log',  
            maxsize: 1024 * 1024 * 10, // 10MB ,
            level: 'info',
            timestamp: function() { return new Date().toLocaleTimeString(); }
          })  
        ]  
    });  
    return logger;
} 



exports.log = log;
function log(methodName) {
    var str = "";
    for (var i = 1; i < arguments.length; i++) {
        str += arguments[i];
        if (i < arguments.length - 1) str += ", ";
    }
    console.log("\n" + logPrefix(methodName) + str);
}

function logPrefix(methodName) {
    return new Date().toLocaleTimeString() + " " + methodName + ": ";
}
