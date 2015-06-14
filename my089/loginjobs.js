var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var request = require("request");
var encrypt = require('./md5');
var simplehttp = require('../simplehttp');

exports.login = login;

function login(account, callback) {
    var user = account.user;
    var password = account.password;

    var cncryptPassword = encrypt(password, 32);
    var cookieJar = request.jar();
    logutil.log("login", user, cncryptPassword);
    simplehttp.POST('https://member.my089.com/safe/login.aspx', {
            txtUid: user,
            MD5Pwd: cncryptPassword, //26b2d9d0b8ba4a441263cc742ebb6772
            SaveMinits: 1440,
            btnLogin:'立即登录',
            "../cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var cookie_string = cookieJar.getCookieString("https://www.my089.com");
           if (cookie_string.indexOf("hlck")>=0) {
                account.loginExtendInterval = 1440*60*1000;
                account.cookieJar = cookieJar;
                getUserInfo(account, function(avaliableBalance) {
                    account.avaliableBalance = avaliableBalance;
                    console.log("avaliableBalance", avaliableBalance);
                    callback(cookieJar);
                })                
            } else {
                callback(null);
            }


        });
}

exports.extendLogin = extendLogin;

function extendLogin(account, callback) {
    logutil.log("my089 extendLogin", "No Need.")
    callback(null);
}

function getUserInfo(account, callback) {
    var url = 'https://i.my089.com/myaccount/';
    simplehttp.GET(url, {
        "../cookieJar": account.cookieJar
    }, function(error, request, body) {
        
        body = htmlparser.getValueFromBody('<div class="zh_list same_zj lf" style="margin-left:29px;">', '元</li>', body);
        var avaliableBalance = Number(htmlparser.getValueFromBody('￥', '</span>', body).replace(',', ''));

        callback(avaliableBalance)
    });
}
