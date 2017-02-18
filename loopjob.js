var LoopJob = function () {
    var logutil = require("./logutil").config('loopjob');
    var simplehttp = require('./simplehttp');

    var loopCounter = 0;
    var errorCounter = 0;
    var jobStatus = {
        url: null,
        httpMethod: "GET",
        parallelRequests: 1,
        loopStarted: false,
        loopPaused: false,
        lastRequestTime: 0,
        isRequestSending: false,
        loopInterval: 500,
        intervalObj: null,
        timeout: 500,
        urlInjection: function (parallelIndex, url) {
            return url
        },
        optionsInjection: function (parallelIndex, options) {
            return options
        },
        responseHandler: null
    };
    var parallelRequests = 1;
    function loopIntervalHandler() {
        // logutil.log("loopIntervalHandler started...")
        for (var i = 0; i < jobStatus.parallelRequests; i++) {
            loopWork(i);
        }
    }

    function loopWork(parallelIndex) {
        if (jobStatus.isRequestSending) {
            return;
        }

        if (jobStatus.loopPaused) {
            //logutil.log("loopPaused!")
            return;
        }

        var timeStemp = new Date().getTime();
        jobStatus.lastRequestTime = timeStemp;
        var url = jobStatus.urlInjection(parallelIndex, jobStatus.url, jobStatus);
        jobStatus.isRequestSending = true;
        loopCounter++;
        if (loopCounter % 1000 === 0) {
            // console.log("loopWork...", loopCounter);    
            logutil.warn("loopjob loopWork :", loopCounter, errorCounter, jobStatus.url);
        }


        var options = {
            "timeout": jobStatus.timeout,
            "cookieJar": null
        };
        jobStatus.optionsInjection(parallelIndex, options);
        var startTime = new Date();
        simplehttp[jobStatus.httpMethod](url, options, function (error, response, body) {
            // logutil.log("loopjob duraiton", new Date()-startTime, error, body);
            if (error) {
                errorCounter++;
            }
            jobStatus.isRequestSending = false;
            jobStatus.responseHandler(error, response, body);

        });
    };

    this.config = function (options) {
        for (var att in options) {
            jobStatus[att] = options[att];
        }
        return this;
    }

    this.startLooping = function () {
        if (jobStatus.loopStarted) {
            console.log("startLoanLoop: Already started!");
            return;
        }

        jobStatus.loopStarted = true;
        jobStatus.intervalObj = setInterval(loopIntervalHandler, jobStatus.loopInterval);
        return this;
    }

    this.stopLooping = function () {
        if (!jobStatus.loopStarted) {
            console.log("stopLooping: Already stopped!");
            return this;
        }

        jobStatus.loopStarted = false;
        clearInterval(jobStatus.intervalObj);
        return this;
    }

    this.isLoopingStarted = function () {
        return jobStatus.loopStarted;
    }

    this.pause = function (msd, info) {

        if (this.timeoutObj) clearTimeout(this.timeoutObj)
        if (!msd) {
            logutil.warn("job pause===========end", msd, new Date().toTimeString(), info);
            jobStatus.loopPaused = false;
            this.timeoutObj = null;
            return;
        }

        logutil.warn("job pause===========", msd, new Date().toTimeString(), info);
        jobStatus.loopPaused = true;
        this.timeoutObj = setTimeout(function () {
            logutil.warn("job pause===========end", new Date().toTimeString(), info);
            jobStatus.loopPaused = false;
            this.timeoutObj = null;
        }, msd)
    }

}

module.exports = LoopJob;
