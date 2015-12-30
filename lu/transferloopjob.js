var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var htmlparser = require('../htmlparser');
var LoopJob = require("../loopjob");
var me = this;

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
        if (!body) {
            isDetecting = false;
            detectLastProductId(callback);
            return;
        }
        var no = htmlparser.getValueFromBody('<span class="pagination-no current">', '</span>', body);
        if (!no) {
            logutil.log("ERROR detectLastProductId");
            isDetecting = false;
            callback(-1);
        } else {
            var page = Number(no);
            simplehttp.GET(url + page, {}, function(error, response, body) {
                var newlineregexp = /\n/g;
                var ids = body ? htmlparser.getSubStringsFromBody('productId=', 'target="_blank"', body, newlineregexp) : null;
                
                if (!ids) {
                    isDetecting = false;
                    detectLastProductId(callback);
                    logutil.log("detectLastProductId failed", page)
                } else {
                    var lidstr = ids[ids.length - 1];
                    var lastPid = htmlparser.getValueFromBody('productId=', '\'', lidstr);
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

exports.rollNewProductCheck = rollNewProductCheck;
function rollNewProductCheck(callback) {
    if (isDetecting) return;
    var transfers = [];
    detectLastProductId(function(productId) {
        console.log("productId=", productId)
        loopNewTransfer_browser(productId, function(product) {
            return callback(product);
        })

    })
}

function randomNumber() {
    return Math.round(Math.random() * 100000);
}

function loopNewTransfer_browser(startId, callback) {
    if (me.loopjob) {
        console.log("loopNewTransfer loopjob existed");
        return;
    }

    var productId = Number(startId);
    var productIdStart = productId;
    var LOOP_INTERVAL = 500;
    var loopjob = new LoopJob().config({
        parallelRequests: 3,
        url: "https://list.lu.com/list/service/product/*/productDetail",
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8 * LOOP_INTERVAL,
        httpMethod: "GET",
        urlInjection: function(parallelIndex, url) {
            if (productId - productIdStart > 500) {
                logutil.log("***productId rolling", productId);
                productIdStart = productId;
            }
            var u = url.replace("*", productId + parallelIndex) + "?t=" + new Date().getTime();
            return u;
        },
        responseHandler: function(error, response, body) {
            if (error) {
                // logutil.log("responseHandler error:", error)
            } else if (response.statusCode == 200) {
                var req = response.request;

                var catchException;
                try {
                    var productObj = JSON.parse(body);

                    if (productObj.productId) {
                        lastDetectTime = new Date();
                        //if (!productObj.publishedAt) logutil.log("no publishAt", body)

                        if (productObj.productType === "TRANSFER_REQUEST" && productObj.tradingMode === "00" && productObj.productStatus === "ONLINE") {
                            callback({
                                productId: productObj.productId,
                                interest: productObj.interestRateDisplay,
                                price: productObj.price,
                                publishTime: productObj.publishedAtDateTime,
                                source: "www.lu.com",
                                producedTime: new Date()
                            });

                            if (productObj.amount < 5000)
                                logutil.log("productStatus", productObj.publishedAtDateTime, productObj.productId, productObj.productStatus, productObj.tradingMode, productObj.price, productObj.interestRateDisplay)

                        } else {
                            //logutil.log("productStatus", productObj.publishedAtDateTime, productObj.productId, productObj.productStatus, productObj.tradingMode)
                        }

                        if (productObj.productId >= productId) {
                            productId = productObj.productId + 1;
                            //console.log("------", productId, productObj.price, productObj.interestRateDisplay)
                        }

                    } else {
                        // logutil.log("body:", body)
                    }
                } catch (e) {
                    catchException = e;
                    // logutil.log("e", e.stack)
                    // console.log(body)    
                } finally {
                    // logutil.log("detectLastProductId", productObj  ? productObj.productId: "no id", catchException)
                    if ((catchException || productObj.productId === 0) && (new Date() - lastDetectTime) > 10000) {
                        lastDetectTime = new Date();
                        // logutil.log("detectLastProductId-----", productId)
                        detectLastProductId(function(lastProductId) {
                            if (lastProductId > productId) {
                                productId = lastProductId;
                                logutil.log("update last product id ==========================", productId)
                            }
                        });
                    }
                }
            } else {
                console.log("?????????????????????????????? statusCode:", response.statusCode, productId)
            }

        }
    });

    loopjob.startLooping();
    me.loopjob = loopjob;
}

function loopNewTransfer_mobile(startId, callback) {
    if (this.loopjob) {
        console.log("loopNewTransfer loopjob existed");
        return;
    }

    var productId = Number(startId);
    var productIdStart = productId;
    var LOOP_INTERVAL = 300;
    var loopjob = new LoopJob().config({
        parallelRequests: 3,
        //url: "https://list.lu.com/list/service/product/*/productDetail",
        url: "https://mapp.lufax.com/mapp/service/public?M4100",
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8 * LOOP_INTERVAL,
        httpMethod: "POST",
        urlInjection: function(parallelIndex, url) {
            url += ("?_" + randomNumber());

            //var u = url.replace("*", productId + parallelIndex) + "?t=" + new Date().getTime();
            return url;
        },
        optionsInjection: function(parallelIndex, options) {
            if (productId - productIdStart > 100) {
                logutil.log("***productId rolling", productId);
                productIdStart = productId;
            }
            options.form = {
                requestCode: "M4100",
                version: "2.8.1",
                params: "{'productId':'" + (productId + parallelIndex) + "','from':'list'}",
                paramsJson: {
                    productId: productId + parallelIndex,
                    from: 'list'
                }
            };

            return options;
        },
        responseHandler: function(error, response, body) {
            if (error) {
                // logutil.log("responseHandler error:", error)
            } else if (response.statusCode == 200) {
                var req = response.request;

                var catchException;
                try {
                    var bodyJson = JSON.parse(body);
                    var productObj = bodyJson.result;

                    if (productObj.productId) {
                        lastDetectTime = new Date();
                        //if (!productObj.publishedAt) logutil.log("no publishAt", body)

                        if (productObj.productType === "TRANSFER_REQUEST" && productObj.tradingMode === "00" && productObj.productStatus === "ONLINE") {
                            callback({
                                productId: productObj.productId,
                                interest: productObj.intrestRateDisplay,
                                price: productObj.amount,
                                publishTime: productObj.publishedAt,
                                source: "www.lu.com",
                                producedTime: new Date()
                            });

                            //if (productObj.amount < 200)
                            // logutil.log("productStatus", productObj.publishedAt, productObj.productId, productObj.productStatus, productObj.tradingMode, productObj.amount, productObj.interestRateDisplay)

                        } else {
                            //logutil.log("productStatus", productObj.publishedAt, productObj.productId, productObj.productStatus, productObj.tradingMode)
                        }

                        if (productObj.productId >= productId) {
                            productId = productObj.productId + 1;
                        }

                    } else if (productObj.lockTip) {
                        var rid = req.__options.form.paramsJson.productId;
                        if (rid >= productId) {
                            productId++;
                        }

                    } else {
                        //logutil.log("body:", body)
                    }
                } catch (e) {
                    catchException = e;
                    logutil.log("e", e.stack)
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
                console.log("?????????????????????????????? statusCode:", response.statusCode)
            }

        }
    });

    loopjob.startLooping();
    me.loopjob = loopjob;
}

exports.stopRollingNewProductCheck = stopRollingNewProductCheck;

function stopRollingNewProductCheck() {
    // clearInterval(rollingIntervalObj)
    this.loopjob.stopLooping();
}

exports.isRollingStarted = isRollingStarted;

function isRollingStarted() {
    // return !!rollingIntervalObj;
    return this.loopjob && this.loopjob.isLoopingStarted();

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
