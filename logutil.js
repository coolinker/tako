var winston = require('winston');
var path = require('path');
winston.add(winston.transports.File, { filename: '/tako.log' });

exports.config = config;
function config() {
    transports = [];
    transports.push(new winston.transports.DailyRotateFile({
        name: 'file',
        datePattern: '.yyyy-MM-dd',
        filename: path.join(__dirname, "logs", "log_file.log")
    }));

    var logger = new winston.Logger({
        transports: transports
    });

    return logger;
}


exports.defaultLogger = defaultLogger;
function defaultLogger () {
    return winston;
}

exports.log = log;
function log1(methodName, str) {
    winston.log(methodName);
}
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
