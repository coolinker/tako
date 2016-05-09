var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort('COM8');
var isSerialPortOpen = false;
serialPort.on('open', function() {
    console.log('open');
    isSerialPortOpen = true;
});


var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.ie()).
build();

//var timeouts = (new webdriver.WebDriver.Timeouts(driver))
//timeouts.setScriptTimeout(10000);

driver.get('http://123.57.39.80/compositions/tako/rrd/web/passguard.html').then(function() {

});

driver.sleep(5000);

driver.executeAsyncScript(function() {
    var callback = arguments[arguments.length - 1];
    window.focus();
    pgeditorChar.pwdclear();
    _ocx_passwordChar.setActive();
    callback("run");
}).then(function(str) {
    console.log("str", str)
    return true;
});

driver.findElement(webdriver.By.id("inp")).sendKeys("");

driver.executeAsyncScript(function() {
    _ocx_passwordChar.removeNode();
    callback("run");
}).then(function(str) {
    console.log("str", str)
    return true;
});
// var isPre = false;
// driver.wait(function() {
//     driver.isElementPresent(webdriver.By.id("_ocx_passwordChar")).then(
//         function(isPresent) {
//             if (isPre) return;
//             isPre = isPresent;
//             console.log("isPre", isPre);

//         })
//     return isPre;
// }, Infinity);

// driver.findElement(webdriver.By.id("_ocx_passwordChar")).sendKeys("").then(function(){
    
// });

driver.sleep(1000).then(function(){
    kbInput("Bcd", function(idx) {
        console.log("finish input", idx);
        //driver.quit();
    });

});


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

// console.log("executeAsyncScript...")
// driver.executeAsyncScript(function() {
//     var callback = arguments[arguments.length - 1];

//     console.log("executeAsyncScript...");
//     console.log(pgeditorChar.pwdLength());
//     pgeditorChar.pwdclear();
//     callback("run");
// }).then(function(str) {
//     console.log("str", str)
//     return true;
// });



// driver.wait(function() {
//     if (new Date().getSeconds() === 24 && new Date().getMinutes() === 25) {
//         console.log("executeAsyncScript...");
//         return true;
//     } else return false;
// }, Infinity);


// driver.executeAsyncScript(function(randomForEnc) {
//     console.log("executeAsyncScript get Pwd result...", randomForEnc);
//     var callback = arguments[arguments.length - 1];
//     pgeditorChar.pwdSetSk(randomForEnc);
//     var PwdResultChar = pgeditorChar.pwdResult();
//     callback(PwdResultChar);
// }, '577745').then(function(str) {
//     console.log("got Pwd result:", str);
//     return true;
// })
