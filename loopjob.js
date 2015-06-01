var simplehttp = require('./simplehttp');
var loopCounter = 0;

 var jobStatus = {
    url: null,
    httpMethod: "GET",
    loopStarted: false,
    lastRequestTime: 0,
    isRequestSending: false,
    loopInterval: 500,
    intervalObj: null,
    timeout: 500,
    urlInjection: function(url) {return url},
    optionsInjection: function(options) {return options},
    responseHandler: null
 }

 exports.config = config;
 function config(options) {
    for (var att in options) {
        jobStatus[att] = options[att];
    }
    return this;
 }
exports.startLooping = startLooping;
 function startLooping() {
    if ( jobStatus.loopStarted) {
        console.log("startLoanLoop: Already started!");
        return;
    }

    jobStatus.loopLoanStarted = true;
    jobStatus.intervalObj = setInterval(loopWork, jobStatus.loopInterval);
 }
exports.stopLooping = stopLooping;
function stopLooping() {
    if ( !jobStatus.loopStarted) {
        console.log("startLoanLoop: Already stopped!");
        return;
    }

    jobStatus.loopStarted = false;
    clearInterval(jobStatus.intervalObj);
}

 function loopWork() {
    if ( jobStatus.isRequestSending) return;
    var timeStemp = new Date().getTime();
    jobStatus.lastRequestTime = timeStemp;
    var url = jobStatus.urlInjection( jobStatus.url);
    jobStatus.isRequestSending = true;
    loopCounter++;
    if (loopCounter%100===0) {
        console.log("loopWork...", loopCounter);    
    }
    

    var options =  {"../timeout": jobStatus.timeout, "../cookieJar":null};
    jobStatus.optionsInjection(options);
    simplehttp[jobStatus.httpMethod](url, options, function(error, response, body) {
            jobStatus.isRequestSending = false;
            jobStatus.responseHandler(error, response, body);
    });
 }
