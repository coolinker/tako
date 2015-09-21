var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var fs = require('fs');
var ndarray = require("ndarray")
var savePixels = require("save-pixels")
var NEED_PRE_CHECK = false;

var imageRepository = require('./captcha/imagerepository').init("./lufax/captcha/data.dat");
var imageUtil = require('./captcha/imageutil');

var imageProcessor = require('./captcha/imageprocessor').config({
    MINOR_PIXEL_NOISE_LIMIT: 20,
    BACKGROUND_COLOR: 255,
    COLOR_RANGE_OFFSET: 5,
    HOLLOW_PIXELS_MAX_NUM: 20,
    COLOR_ISLET_MAX_NUM: 20
});


exports.guessCaptchaForTrading = guessCaptchaForTrading;

function guessCaptchaForTrading(productId, sid, cookieJar, callback) {
    var startTime = new Date();
    simplehttp.POST("https://trading.lu.com/trading/service/trade/captcha/create-captcha", {
            "cookieJar": cookieJar,
            "form": {
                sid: sid,
                productId: productId
            }
        },
        function(err, httpResponse, body) {
            
            var captchaInfo = JSON.parse(body);
            if (!captchaInfo.imageId) {
                callback();
                return;
            }
            getCaptchaByImageId(captchaInfo.imageId, cookieJar, function(image) {
                logutil.log("get Image:", new Date()-startTime)
                var cstart = new Date();
                var captachStr = crackCaptcha(image);
                logutil.log("crack Image:", new Date()-cstart,  new Date()-startTime)
                if (!NEED_PRE_CHECK) {
                    callback(captachStr, captchaInfo.imageId);
                } else {
                    captachaPreCheck(captachStr, "sid=" + sid + "&imgId=" + captchaInfo.imageId, cookieJar, function(success) {
                        logutil.log("guessCaptcha", captchaInfo.imageId, captachStr, success);
                        if (success) {
                            callback(captachStr, captchaInfo.imageId);
                        } else {
                            guessCaptchaForTrading(productId, sid, cookieJar, callback)
                        }
                    })
                }

            })
        });
}

function getCaptchaByImageId(imageId, cookieJar, callback) {
    simplehttp.image("https://user.lu.com/user/captcha/get-captcha?source=1&imageId=" + imageId + "&_=" + new Date().getTime(), {
            "cookieJar": cookieJar,
            type: 'image/jpeg'
        },
        function(err, pixels) {
            if (err) console.log("getCaptchaByImageId:", "https://user.lu.com/user/captcha/get-captcha?source=1&imageId=" + imageId + "&_=" + new Date().getTime(),
                err);
            var image = {
                width: pixels.shape[0],
                height: pixels.shape[1],
                data: pixels.data
            };
            //var str = crackCaptcha(image);
            callback(image);

        });
}


exports.guessCaptchaForLogin = guessCaptchaForLogin;

function guessCaptchaForLogin(source, cookieJar, callback) {
    getCaptchaBySource(source, cookieJar, function(captchaImage) {
        var captachStr = crackCaptcha(captchaImage);
        preCheck(captachStr, "source=" + source, cookieJar, function(success) {
            // logutil.log("guessCaptcha", source, captachStr, success);
            if (success) {
                callback(captachStr);
            } else {
                guessCaptchaForLogin(source, cookieJar, callback)
            }
        })
    });
}

function getCaptchaBySource(source, cookieJar, callback) {
    simplehttp.image("https://user.lu.com/user/captcha/captcha.jpg?source=" + source + "&_=" + new Date().getTime(), {
            "cookieJar": cookieJar,
            type: 'image/jpeg'
        },
        function(err, pixels) {
            var image = {
                width: pixels.shape[0],
                height: pixels.shape[1],
                data: pixels.data
            };
            //var str = crackCaptcha(image);

            callback(image);
        });
}

function crackCaptcha(imageData) {
    var imgs = imageProcessor.getMainColorGroupImages(imageData);
    var captachStr = "";
    for (var i = 0; i < imgs.length; i++) {
        imageProcessor.rotateToMinWidth(imgs[i]);
        imageUtil.makeSingleColor(imgs[i], 0);

        imgs[i] = imageUtil.removePadding(imgs[i], 255);
        imgs[i] = imageUtil.scale(imgs[i], 32, 32);

        // var nda = ndarray(new Float32Array(imgs[i].data), [imgs[i].width, imgs[i].height, 4], [4, imgs[i].width * 4, 1]);
        // savePixels(nda, "png").pipe(fs.createWriteStream("lufax/guess/" + i + ".png"));

        var charactor = imageRepository.guess(imgs[i], "charactor");
        // console.log("charactor:", charactor)
        captachStr += charactor;
    }

    return captachStr;
}

function captachaPreCheck(captachaStr, paramsStr, cookieJar, callback) {
    //https://trading.lu.com/trading/service/trade/captcha-pre-check?captcha=jpc4&sid=11559022&imgId=780a5d16b87248eeab325d7c662c98fa&_=1438964923475
    var url = "https://trading.lu.com/trading/service/trade/captcha-pre-check?captcha=" + captachaStr + "&" + paramsStr + "&_=" + new Date().getTime();
    console.log("checkCaptacha", url);
    simplehttp.GET(url, {
        "cookieJar": cookieJar
    }, function(error, request, body) {
        console.log("body", error, body)
        json = JSON.parse(body);
        if (json.result === "SUCCESS") {
            callback(true);
        } else {
            console.log("-----------------------------", json);
            callback(false);
        }
    });
}

function preCheck(captachaStr, paramsStr, cookieJar, callback) {
    var url = "https://user.lu.com/user/captcha/pre-check?inputValue=" + captachaStr + "&" + paramsStr + "&_=" + new Date().getTime();

    simplehttp.GET(url, {
        "cookieJar": cookieJar
    }, function(error, request, body) {
        // console.log("check:", error, body)
        json = JSON.parse(body);
        if (json.result === "SUCCESS") {
            callback(true);
        } else {
            callback(false);
        }
    });
}
