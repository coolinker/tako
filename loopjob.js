var LoopJob = function() {
    var logutil = require("./logutil");
    var simplehttp = require('./simplehttp');

    var loopCounter = 0;
    var errorCounter = 0;
    var jobStatus = {
        url: null,
        httpMethod: "GET",
        loopStarted: false,
        lastRequestTime: 0,
        isRequestSending: false,
        loopInterval: 500,
        intervalObj: null,
        timeout: 500,
        urlInjection: function(url) {
            return url
        },
        optionsInjection: function(options) {
            return options
        },
        responseHandler: null
    };

    function loopWork() {
        if (jobStatus.isRequestSending) return;
        var timeStemp = new Date().getTime();
        jobStatus.lastRequestTime = timeStemp;
        var url = jobStatus.urlInjection(jobStatus.url);
        jobStatus.isRequestSending = true;
        loopCounter++;
        if (loopCounter % 1000 === 0) {
            // console.log("loopWork...", loopCounter);    
            logutil.log("loopjob loopWork :", loopCounter, errorCounter, jobStatus.url);
        }


        var options = {
            "timeout": jobStatus.timeout,
            "cookieJar": null
        };
        jobStatus.optionsInjection(options);
        simplehttp[jobStatus.httpMethod](url, options, function(error, response, body) {
            if (error) {
                errorCounter++;
            }
            jobStatus.isRequestSending = false;
            jobStatus.responseHandler(error, response, body);
        });
    };

    this.config = function(options) {
        console.log("jobStatus-----", jobStatus.url);
        for (var att in options) {
            jobStatus[att] = options[att];
        }
        return this;
    }

    this.startLooping = function() {
        if (jobStatus.loopStarted) {
            console.log("startLoanLoop: Already started!");
            return;
        }

        jobStatus.loopLoanStarted = true;
        jobStatus.intervalObj = setInterval(loopWork, jobStatus.loopInterval);
    }

    this.stopLooping = function() {
        if (!jobStatus.loopStarted) {
            console.log("startLoanLoop: Already stopped!");
            return;
        }

        jobStatus.loopStarted = false;
        clearInterval(jobStatus.intervalObj);
    }

}

module.exports = LoopJob;
