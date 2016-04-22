var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var requestlib = require("request");
var simplehttp = require('../simplehttp');

var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort('COM8');
var isSerialPortOpen = false;
var startInputJYPwd = false;
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

driver.get('http://localhost:8080/minsheng.html').then(function() {

});

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

                } else {
                    console.log("ERROR consumejob consume", toBeConsumed.transferId, body);
                    if (callback) callback(null);
                }

            });
}

function autoInputJYPwd(account, params, callback) {
    driver.wait(function() {
        if (!startInputJYPwd) {
            startInputJYPwd = true;
            return true;
        }
        return !startInputJYPwd;
    }, Infinity);

    driver.isElementPresent(webdriver.By.id("_ocx_passwordChar"));
    var inputFinished = false;
    driver.executeAsyncScript(function() {
        var callback = arguments[arguments.length - 1];
        console.log("executeAsyncScript...clear input", pgeditorChar.pwdLength());
        pgeditorChar.pwdclear();
        callback("cleared:"+pgeditorChar.pwdLength());
    }).then(function(str) {
        console.log(str)
        return true;
    });

    driver.findElement(webdriver.By.id("_ocx_passwordChar")).sendKeys("").then(function(){
        console.log("serialPort password input start", account.tradePassword) 
        kbInput(account.tradePassword, function(result) { 
            console.log("serialPort password input finished", result) 
            inputFinished = true;
        });

    });

     driver.wait(function() {
        if (inputFinished) console.log("Input finished")
        return inputFinished;
    }, Infinity);
    
    // driver.sleep(1000).then(function(){
    //     console.log("randomForEnc", params.randomForEnc)
    // });

    driver.executeAsyncScript(function(randomForEnc) {
        console.log("executeAsyncScript get Pwd result...", randomForEnc);
        var callback = arguments[arguments.length - 1];
        pgeditorChar.pwdSetSk(randomForEnc);
        var PwdResultChar = pgeditorChar.pwdResult();
        console.log("executeAsyncScript get Pwd result...", PwdResultChar);
        callback(PwdResultChar);
    }, params.randomForEnc).then(function(str) {
        console.log("got Pwd result", str);
        callback(str);
        startInputJYPwd = false;
        return true;
    })

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
    console.log("doTransferApplyByCust:")
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
    console.log(context)
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