var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var requestlib = require("request");
var simplehttp = require('../simplehttp');

var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort('COM8');
var isSerialPortOpen = false;
var startedInputJYPwd = false;
serialPort.on('open', function() {
    console.log('serialPort open');
    isSerialPortOpen = true;
});

var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.ie()).
build();
console.log("initialize cmbcPwd...")
var timeouts = (new webdriver.WebDriver.Timeouts(driver))
timeouts.setScriptTimeout(10000);

driver.get('http://123.57.39.80/compositions/tako/rrd/web/passguard.html');
// driver.sleep(5000);
// driver.executeAsyncScript(function() {
//     var callback = arguments[arguments.length - 1];
//    //console.log("executeAsyncScript...clear input", pgeditorChar.pwdLength());
//     window.focus();
//     pgeditorChar.pwdLength();
//     pgeditorChar.pwdclear();
//     _ocx_passwordChar.setActive();
//     callback("cleared:");
// }).then(function(str) {
//     console.log("-----------------------ie run js test succeed!")
//     return true;
// });



exports.cmbcPageHandler = cmbcPageHandler;
function cmbcPageHandler(account, actionurl, context, callback) {
    // console.log("cmbcPageHandler", actionurl, context);
    var newjar = requestlib.jar();
    simplehttp.POST(actionurl, {
                form: {
                    actionUrl: actionurl,
                    context: context
                },
                "cookieJar": newjar
            },
            function(err, request, body) {
                if (request.statusCode === 200) {
                //     <input type="hidden" name="secuNo"      value="0007" />
                // <input type="hidden" name="usrId"       value="44581" />
                // <input type="hidden" name="token"       value="e0936704-5da2-4cc0-bb51-fd5046d6fe01_86ee002fe9ddf59802b7aff209eaa5bb" />
                // <input type="hidden" name="orderId"  value="1217000000033T010089231AQQ3Y1UWY" />
                // <input type="hidden" name="bussNo"      value="" />
                // <input type="hidden" name="transCode"      value="P2P_T000012" />
                // <input type="hidden" name="fundAcc" value="9595101018975000" id="fundAcc" />
                // <input name="tradePwd" type="hidden" id="tradePwd" class="text01" />
                // <input type="hidden" id="randomForEnc" name="randomForEnc" value="445500" />
                    
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
                    //console.log("cmbcPageHandler---------------",obj)
                    freeToInputJYPwd(function(){
                        autoInputJYPwd(account, obj, function(pwdCode){
                        obj.tradePwd = pwdCode;
                        validJYPwd(obj, newjar, function(validRes) {
                            if (validRes.retCode === '0000') {
                                doTransferApplyByCust(obj, newjar, function(succeed){
                                    console.log("---------------------------succeed:", succeed)
                                    callback(succeed);
                                })
                            } else {
                                console.log("Valid password failed", validRes)
                            }
                        });
                    });
                    })
                    

                } else {
                    console.log("ERROR consumejob consume", toBeConsumed.transferId, body);
                    if (callback) callback(null);
                }

            });
}

function freeToInputJYPwd(callback){
    if (startedInputJYPwd === false) {
        callback();
    } else {
        setTimeout(function(){
            freeToInputJYPwd(callback);
        }, 1000)
    }
}

function autoInputJYPwd(account, params, callback) {
    startedInputJYPwd = true;
    var inputFinished = false;
    driver.executeAsyncScript(function() {
        var callback = arguments[arguments.length - 1];
        //console.log("executeAsyncScript...clear input", pgeditorChar.pwdLength());
        window.focus();
        pgeditorChar.pwdclear();
        _ocx_passwordChar.setActive();
        callback("cleared:"+pgeditorChar.pwdLength());
    }).then(function(str) {
        console.log("-----------------------start input")
        kbInput(account.tradePassword, function(result) { 
            inputFinished = true;
        });

        return true;
    });

    // driver.findElement(webdriver.By.id("_ocx_passwordChar")).sendKeys("").then(function(){
        
        
    // });

     driver.wait(function() {
        if (inputFinished) console.log("Input finished")
        return inputFinished;
    }, Infinity);
    
    // driver.sleep(1000).then(function(){
    //     console.log("randomForEnc", params.randomForEnc)
    // });

    driver.executeAsyncScript(function(randomForEnc) {
        //console.log("executeAsyncScript get Pwd result...", randomForEnc);
        var callback = arguments[arguments.length - 1];
        pgeditorChar.pwdSetSk(randomForEnc);
        var PwdResultChar = pgeditorChar.pwdResult();
        //console.log("executeAsyncScript get Pwd result...", PwdResultChar);
        callback(PwdResultChar);
    }, params.randomForEnc).then(function(str) {
        console.log("got Pwd result", str);
        callback(str);
        return true;
    })

    driver.get('http://123.57.39.80/compositions/tako/rrd/web/passguard.html').then(function(){
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
        var delay = (nextchar>=65 && nextchar<=90)?140:40;
        //console.log(nextchar, delay)
        serialPort.drain(function() {
            setTimeout(function(){
                kbInput(str, callback, idx);
            }, delay)
            
        });
    });
}

function validJYPwd(params, jar, callback) {
    console.log("validJYPwd:", params)
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
    logutil.log("doTransferApplyByCust:")
    simplehttp.POST('https://tbank.cmbc.com.cn:50002/tradeBank//trans/doTransferApplyByCust.html', {
                form: params,
                "cookieJar": jar
            },
            function(err, request, body) {
                //logutil.log("----------", body)
                redirectToWe(body, jar, callback)
            });
}

function redirectToWe(body, jar, callback){
    var succeed = body.indexOf("即将为您跳转页面，请稍后")>0;
    var errorcode = htmlparser.getValueFromBody('错误码：', '</td>', body);
    var errormsg = htmlparser.getValueFromBody('错误描述：', '</td>', body);

    var url = htmlparser.getValueFromBody('action="', '" method', body);
    var context = htmlparser.getValueFromBody('<input name="context" value="', '" />', body);
    logutil.log("=========", succeed, errorcode, errormsg, url);
     callback(succeed);
    // simplehttp.POST(url, {
    //             form: {
    //                 "context": context
    //             },
    //             "cookieJar": jar
    //         },
    //         function(err, request, body) {
    //             console.log("----------", body)
    //             callback(succeed);
    //         });
}