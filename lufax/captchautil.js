var fs = require('fs');
var ndarray = require("ndarray")
var savePixels = require("save-pixels")

var imageRepository = require('./captcha/imagerepository').init("./lufax/captcha/data.dat");
var imageUtil = require('./captcha/imageutil');

var imageProcessor = require('./captcha/imageprocessor').config({
    MINOR_PIXEL_NOISE_LIMIT: 20,
    BACKGROUND_COLOR: 255,
    COLOR_RANGE_OFFSET: 5,
    HOLLOW_PIXELS_MAX_NUM: 20,
    COLOR_ISLET_MAX_NUM: 20
});

exports.guessCaptcha = guessCaptcha;
function guessCaptcha(source, cookieJar, callback) {
    getCaptcha(source, cookieJar, function(captachStr) {
        checkCaptacha(captachStr, source, cookieJar, function(success) {
            logutil.log("guessCaptcha", source, captachStr, success);
            if (success) {
                callback(captachStr);
            } else {
                guessCaptcha(source, cookieJar, callback)
            }
        })
    });
}

function getCaptcha(source, cookieJar, callback) {
    simplehttp.image("https://user.lufax.com/user/captcha/captcha.jpg?source=" + source + "&_=" + new Date().getTime(), {
            "cookieJar": cookieJar,
            type: 'image/jpeg'
        },
        function(err, pixels) {
            var image = {
                width: pixels.shape[0],
                height: pixels.shape[1],
                data: pixels.data
            };
            var str = crackCaptcha(image);

            callback(str);
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

function checkCaptacha(captachaStr, source, cookieJar, callback) {
    var url = "https://user.lufax.com/user/captcha/pre-check?inputValue=" + captachaStr + "&source=" + source + "&_=" + new Date().getTime();

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
