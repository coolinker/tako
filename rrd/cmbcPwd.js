var htmlparser = require('../htmlparser');
var logutil = require("../logutil").config("rrdconsume");;
var requestlib = require("request");
var simplehttp = require('../simplehttp');

var serialport = require('serialport');
var spName;
var serialPort;
var isSerialPortOpen = false;
var startedInputJYPwd = false;

serialport.list(function(err, ports) {
    logutil.info("list ports:")
    ports.forEach(function(port) {
        spName = port.comName;
        logutil.info(port.comName, port.pnpId, port.manufacturer);
    });

    serialPort = new serialport.SerialPort(spName);
    serialPort.on('open', function() {
        logutil.info('serialPort open', spName);
        isSerialPortOpen = true;
    });

});


var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.ie()).
build();

logutil.info("initialize cmbcPwd...")
///var timeouts = driver.manage().timeouts();
//timeouts.setScriptTimeout(10000);
var passwordPageReady = false;
driver.get('http://123.57.39.80/compositions/tako/rrd/web/passguard.html').then(function(){
    passwordPageReady = true;
});

exports.cmbcPageHandler = cmbcPageHandler;
function cmbcPageHandler(account, actionurl, context, callback) {
    // logutil.info("cmbcPageHandler", actionurl, context);
    var newjar = requestlib.jar();
    simplehttp.POST(actionurl, {
            form: {
                actionUrl: actionurl,
                context: context
            },
            "cookieJar": newjar
        },
        function(err, request, body) {
            if (request && request.statusCode === 200) {
                var obj = {};
                obj.secuNo = htmlparser.getValueFromBody('name="secuNo"      value="', '" />', body);

                obj.usrId = htmlparser.getValueFromBody('name="usrId"       value="', '" />', body);
                obj.token = htmlparser.getValueFromBody('name="token"       value="', '" />', body);
                obj.orderId = htmlparser.getValueFromBody('name="orderId"  value="', '" />', body);
                obj.bussNo = htmlparser.getValueFromBody('name="bussNo"      value="', '" />', body);
                obj.transCode = htmlparser.getValueFromBody('name="transCode"      value="', '" />', body);
                obj.fundAcc = htmlparser.getValueFromBody('name="fundAcc" value="', '" id=', body);
                // obj.tradePwd = htmlparser.getValueFromBody('name="tradePwd"       value="', '" />', body);
                obj.randomForEnc = htmlparser.getValueFromBody('name="randomForEnc" value="', '" />', body);
                freeToInputJYPwd(function() {
                    autoInputJYPwd(account, obj, function(pwdCode) {
                        obj.tradePwd = pwdCode;
                        // validJYPwd(obj, newjar, function(validRes) {
                        //     if (validRes.retCode === '0000') {

                                doTransferApplyByCust(obj, newjar, function(succeed) {
                                    callback(succeed);
                                })
                        //     } else {
                        //         logutil.info("Valid password failed",account.tradePassword.length,  validRes)
                        //         callback(false)
                        //     }
                        // });
                    });
                })


            } else {
                logutil.info("ERROR consumejob consume", err, '\n', actionurl, '\n', context, body);
                if (callback) callback(null);
            }

        });
}

function freeToInputJYPwd(callback) {
    if (startedInputJYPwd === false) {
        callback();
    } else {
        setTimeout(function() {
            freeToInputJYPwd(callback);
        }, 1000)
    }
}

function autoInputJYPwd(account, params, callback) {
    if (!passwordPageReady) {
        callback(null);
        return;
    }
    startedInputJYPwd = true;
    var inputFinished = false;
    driver.executeAsyncScript(function() {
        var callback = arguments[arguments.length - 1];
        //logutil.info("executeAsyncScript...clear input", pgeditorChar.pwdLength());
        window.focus();
        pgeditorChar.pwdclear();
        _ocx_passwordChar.setActive();
        callback(pgeditorChar.pwdLength());
    }).then(function(str) {
        // logutil.info("-----------------------start input")
        kbInput(account.tradePassword, function(result) {
            inputFinished = true;
        });

        return true;
    });

    driver.wait(function() {
        //if (inputFinished) logutil.info("Input finished")
        return inputFinished;
    }, Infinity);

    driver.executeAsyncScript(function(randomForEnc) {
        //logutil.info("executeAsyncScript get Pwd result...", randomForEnc);
        var callback = arguments[arguments.length - 1];
        pgeditorChar.pwdSetSk(randomForEnc);
        var PwdResultChar = pgeditorChar.pwdResult();
        //logutil.info("executeAsyncScript get Pwd result...", PwdResultChar);
        callback(PwdResultChar);
    }, params.randomForEnc).then(function(str) {
        logutil.info("got Pwd result", str);
        callback(str);
        return true;
    })

    driver.get('http://123.57.39.80/compositions/tako/rrd/web/passguard.html').then(function() {
        startedInputJYPwd = false;
    });
}

function kbInput(str, callback, idx) {
    if (idx === undefined) idx = 0;
    if (idx === str.length) {
        callback(idx)
        return;
    }
    var nextchar = str.charCodeAt(idx);
    serialPort.write([nextchar], function() {
        idx++;
        var delay = (nextchar >= 65 && nextchar <= 90) ? 140 : 40;
        //logutil.info(nextchar, delay)
        serialPort.drain(function() {
            setTimeout(function() {
                kbInput(str, callback, idx);
            }, delay)

        });
    });
}

function validJYPwd(params, jar, callback) {
    //logutil.info("validJYPwd:", params)
    simplehttp.POST('https://tbank.cmbc.com.cn:50002/tradeBank/trans/validatePwd.json', {
            form: params,
            "cookieJar": jar
        },
        function(err, request, body) {
            var validRes = JSON.parse(body)
            callback(validRes)
        });
}


function doTransferApplyByCust(params, jar, callback) {
    logutil.info("doTransferApplyByCust:")
    simplehttp.POST('https://tbank.cmbc.com.cn:50002/tradeBank//trans/doTransferApplyByCust.html', {
            form: params,
            "cookieJar": jar
        },
        function(err, request, body) {
            //logutil.log("----------", body)
            redirectToWe(body, jar, callback)
        });
}

function redirectToWe(body, jar, callback) {
    var succeed = body.indexOf("即将为您跳转页面，请稍后") > 0;
    var errorcode = htmlparser.getValueFromBody('错误码：', '</td>', body);
    var errormsg = htmlparser.getValueFromBody('错误描述：', '</td>', body);

    var url = htmlparser.getValueFromBody('action="', '" method', body);
    var context = htmlparser.getValueFromBody('<input name="context" value="', '" />', body);
    logutil.info("redirectToWe", succeed, errorcode, errormsg, url);
    callback(succeed);
    // simplehttp.POST(url, {
    //             form: {
    //                 "context": context
    //             },
    //             "cookieJar": jar
    //         },
    //         function(err, request, body) {
    //             logutil.info("----------", body)
    //             callback(succeed);
    //         });
}
