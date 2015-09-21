var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var htmlparser = require('../htmlparser');
var LoopJob = require("../loopjob");
var me = this;
var LOOP_INTERVAL = 2000;
var MAXMONEY = 10000;
var MINMONEY = 0;
var MINRATE = 0.084;

var isDetecting = false;
var lastDetectTime = new Date();

var rollingIntervalObj;

function detectLastProductId(callback) {
    if (isDetecting) return;
    isDetecting = true;
    var url = 'http://list.lu.com/list/transfer/anyi?minMoney=&maxMoney=&minDays=&maxDays=&minRate=&maxRate=&mode=&trade=&isCx=&currentPage=';
    simplehttp.GET(url + 10000, {}, function(error, response, body) {
        if (!body) return;

        var no = htmlparser.getValueFromBody('<span class="pagination-no current">', '</span>', body);

        if (!no) {
            logutil.log("ERROR detectLastProductId");
            isDetecting = false;
            callback(-1);
        } else {
            var page = Number(no);
            simplehttp.GET(url + page, {}, function(error, response, body) {
                
                var newlineregexp = /\n/g;
                var ids = htmlparser.getSubStringsFromBody('productId=', 'target="_blank"', body, newlineregexp);

                if (!ids) {
                    isDetecting = false;
                    detectLastProductId(callback);
                    logutil.log("********************detectLastProductId failed")
                } else {

                    var lidstr = ids[ids.length - 1];
                    var lastPid = htmlparser.getValueFromBody('productId=', ' target="_blank"', lidstr);
                    callback(Number(lastPid));
                    isDetecting = false;
                }

            })

        }
    });
}


function detectLastPage(callback) {
    if (isDetecting) return;
    isDetecting = true;
    var url = 'http://list.lu.com/list/transfer/anyi?minMoney=' + MINMONEY + '&maxMoney=' + MAXMONEY + '&minDays=&maxDays=&minRate=' + MINRATE + '&maxRate=0.2&mode=&trade=FIX_PRICE&isCx=&currentPage=10000'
    simplehttp.GET(url, {}, function(error, response, body) {
        var no = htmlparser.getValueFromBody('<span class="pagination-no current">', '</span>', body);
        if (no !== null) {
            callback(Number(no));
        } else {
            callback(null);
        }

        isDetecting = false;

    });
}

// exports.startNewTransferLoop = startNewTransferLoop;

// function startNewTransferLoop(callback) {
//     if (isDetecting) return;

//     var transfers = [];
//     detectLastProductId(function(productId) {
//         loopNewTransfer(productId, function(product) {
//             return callback(product);
//         })

//     })
// }

exports.rollNewProductCheck = rollNewProductCheck;

function rollNewProductCheck(callback) {
    var  latestProductId = 0;
    rollingIntervalObj = setInterval(function() {
        detectLastProductId(function(productId) {
            if (productId > latestProductId) {
                callback({productId:productId, source: "www.lufax.com"})
                latestProductId = productId;
            }
            

        })
    }, 10000);
}

function loopNewTransfer(startId, callback) {
    if (this.loopjob) {
        console.log("loopNewTransfer loopjob existed");
        return;
    }

    var productId = Number(startId);
    var hasNew = false;

    var loopjob = new LoopJob().config({
        parallelRequests: 5,
        url: "https://list.lu.com/list/service/product/*/productDetail",
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8 * LOOP_INTERVAL,
        urlInjection: function(parallelIndex, url) {
            var u = url.replace("*", productId + parallelIndex) + "?t=" + new Date().getTime();
            return u;
        },
        responseHandler: function(error, request, body) {
            if (error) {
                // logutil.log("responseHandler error:", error)
            } else if (request.statusCode == 200) {
                var catchException;
                try {
                    var productObj = JSON.parse(body);

                    if (productObj.productId !== 0) {
                        hasNew = true;
                        lastDetectTime = new Date();

                        if (productObj.productType === "TRANSFER_REQUEST" && productObj.tradingMode === "00" && productObj.productStatus === "ONLINE") {
                            callback({
                                productId: productObj.productId,
                                interest: productObj.interestRateDisplay,
                                price: productObj.price,
                                publishTime: productObj.publishedAtDateTime,
                                source: "www.lufax.com",
                                producedTime: new Date()
                            });
                        } else {

                            logutil.log("productStatus", productObj.publishedAtDateTime, productObj.productId, productObj.productStatus, productObj.tradingMode)
                        }

                        if (productObj.productId >= productId) {
                            productId = productObj.productId + 1;
                        }

                    } else {
                        if (hasNew) logutil.log("--");
                        hasNew = false;
                    }
                } catch (e) {
                    catchException = e;
                    // // logutil.log("json error, too busy", productId)
                    // if ((new Date() - lastDetectTime) > 10000) {
                    //         lastDetectTime = new Date();
                    //         detectLastProductId(function(lastProductId) {
                    //             if (lastProductId > productId) {
                    //                 productId = lastProductId;
                    //                 logutil.log("update last product id ==========================", productId)
                    //             }
                    //         });
                    //     }
                } finally {
                    if ((catchException || productObj.productId === 0) && (new Date() - lastDetectTime) > 10000) {
                        lastDetectTime = new Date();
                        logutil.log("detectLastProductId", productId)
                        detectLastProductId(function(lastProductId) {
                            if (lastProductId > productId) {
                                productId = lastProductId;
                                logutil.log("update last product id ==========================", productId)
                            }
                        });
                    }
                }
            } else {
                console.log("?????????????????????????????? statusCode:", request.statusCode)
            }

        }
    });

    loopjob.startLooping();
    me.loopjob = loopjob;
}

exports.stopRollingNewProductCheck = stopRollingNewProductCheck;
function stopRollingNewProductCheck() {
    clearInterval(rollingIntervalObj)
}

exports.isRollingStarted = isRollingStarted;
function isRollingStarted() {
    return !!rollingIntervalObj;
}

exports.isLoopingStarted = isLoopingStarted;

function isLoopingStarted() {
    return this.loopjob && this.loopjob.isLoopingStarted();
}

exports.pauseNewTransferLoop = pauseNewTransferLoop;

function pauseNewTransferLoop(msc) {
    logutil.log("pauseNewTransferLoop... lufax", msc);
    this.loopjob.pause(msc);
}

exports.stopNewTransferLoop = stopNewTransferLoop;

function stopNewTransferLoop() {
    logutil.log("stopNewTransferLoop... lufax");
    this.loopjob.stopLooping();
}

function getProductsDetail(index, products) {
    var product = products[index];

    var url = "http://list.lu.com/list/productDetail?productId=" + product.productId;
    simplehttp.GET(url, {}, function(error, response, body) {

        try {
            var principal = htmlparser.getValueFromBody('<td><strong>', ' 元', htmlparser.getValueFromBody('<td>项目本金：</td>', '</strong></td>', body)).replace(',', '');
            product.principal = Number(principal);
        } catch (e) {
            console.log("----", body.indexOf('<td>项目本金：</td>'), product)
        }


        var trueprice = htmlparser.getValueFromBody('项目价值</span>：', '元', body);
        if (trueprice) {
            trueprice = trueprice.replace(',', '');
            product.truePrice = Number(trueprice);
        }


        if (index < products.length - 1) {
            getProductsDetail(index + 1, products);
        }

    });
}



// function getProductsInPage(pageNo, callback) {
//     var url = 'http://list.lufax.com/list/transfer?minMoney=200&maxMoney=10000&minDays=&maxDays=&minRate=0.08&maxRate=0.2&mode=&trade=&isCx=&currentPage=' + pageNo;
//     simplehttp.GET(url, {}, function(error, response, body) {
//         var isLastPage = body.indexOf('<span class="btns btn_page disabled btn_small next">') > -1;
//         var regexp = /\n/g;
//         var eles = htmlparser.getSubStringsFromBody('<li class="product-list  clearfix  ">', '</div>    </li>', body, regexp);
//         var products = [];
//         for (var i = 0; eles && i < eles.length; i++) {
//             var action = htmlparser.getValueFromBody('class="list-btn">', '</a>', eles[i]);
//             if (action !== null) {
//                 action = action.replace(/ /g, '');
//                 if (action === "投资") {
//                     var prd = {
//                         productId: Number(htmlparser.getValueFromBody('<a href=/list/productDetail?productId=', ' target=', eles[i])),
//                         productType: htmlparser.getValueFromBody('title="', '">', eles[i]),
//                         interest: Number(htmlparser.getValueFromBody('<p class="num-style">', '%</p>', eles[i])) / 100,
//                         price: Number(htmlparser.getValueFromBody('<em class="num-style">', '</em>元', eles[i]).replace(',', ''))
//                     }
//                     products.push(prd)
//                 }
//             }
//         }
//         callback(products, isLastPage)
//     });

// }
