var logutil = require("../logutil").config("lutransfer");
var simplehttp = require('../simplehttp');
var htmlparser = require('../htmlparser');
var LoopJob = require("../loopjob");
var mobileheaderutil = require("./mobileheaderutil");
var pppoeutil = require("../pppoeutil");

var me = this;

var MAXMONEY = 10000;
var MINMONEY = 0;
var MINRATE = 0.084;

var isDetecting = false;
// var lastDetectTime;

var rollingIntervalObj;

function detectLastProductId(callback) {
    if (isDetecting) return;
    isDetecting = true;
    var url = 'https://list.lu.com/list/transfer-p2p?minMoney=&maxMoney=&minDays=&maxDays=&minRate=&maxRate=&mode=&tradingMode=NOW&isCx=&orderCondition=&isShared=&canRealized=&productCategoryEnum=&currentPage='
    simplehttp.GET(url + 10000, {}, function (error, response, body) {
        if (!body) {
            isDetecting = false;
            detectLastProductId(callback);
            return;
        }
        var no = htmlparser.getValueFromBody('id="pageCount" value="', '">', body);
        if (!no) {
            logutil.error("ERROR detectLastProductId");
            isDetecting = false;
            callback(-1);
        } else {
            var page = Number(no);

            page = "";

            simplehttp.GET(url + page, {}, function (error, response, body) {
                var newlineregexp = /\n/g;
                var ids = body ? htmlparser.getSubStringsFromBody('productId=', 'target="_blank"', body, newlineregexp) : null;

                if (!ids) {
                    isDetecting = false;
                    detectLastProductId(callback);
                    logutil.info("detectLastProductId failed", page)
                } else {
                    var lidstr = ids[0];
                    var lastPid = htmlparser.getValueFromBody('productId=', '\'', lidstr);
                    console.log("get last Pid", lastPid)
                    detectLatestProductId(Number(lastPid), 0, 3000, function (pid) {
                        callback(pid);
                        isDetecting = false;
                    });
                }
            })
        }
    });
}

function detectLatestProductId(pid, pidstep, interval, callback) {
    var url = "https://list.lu.com/list/service/product/" + (pid + pidstep) + "/productDetail";
    var delay = 100;
    console.log("===detectLatestProductId", pid, pidstep, new Date())
    simplehttp.GET(url, {}, function (error, response, body) {
        var productObj;
        try {
            productObj = JSON.parse(body);
        } catch (e) {
            logutil.info("e:", e, pid, pidstep, interval)
            callback(pid + pidstep);
            return;
        }
        if (!productObj) {
            setTimeout(function () {
                detectLatestProductId(pid, pidstep, interval, callback);
            }, delay)

        } else if (productObj.productId) {
            var time = Math.max(0, new Date() - new Date(productObj.publishedAtDateTime));
            var steps = Math.floor(time / interval);
            if (!productObj.publishedAtDateTime) steps = 1;
            //logutil.info("detectLatestProductId===", pid+pidstep, steps, interval, productObj.publishedAtDateTime)
            if (steps >= 1) {
                setTimeout(function () {
                    detectLatestProductId(pid + pidstep, steps, interval, callback)
                }, delay)
            } else {
                callback(pid + pidstep);
            }
        } else if (pidstep === 1) {
            logutil.info("detectLatestProductId step is 1", pid, 2 * interval, body)
            callback(pid + pidstep);
        } else {
            //logutil.info("detectLatestProductId 2*interval", pid, pidstep,  2* interval)
            setTimeout(function () {
                detectLatestProductId(pid, 1, 2 * interval, callback)
            }, delay);
        }

    })
}

function detectLastPage(callback) {
    if (isDetecting) return;
    isDetecting = true;
    var url = 'http://list.lu.com/list/transfer/anyi?minMoney=' + MINMONEY + '&maxMoney=' + MAXMONEY + '&minDays=&maxDays=&minRate=' + MINRATE + '&maxRate=0.2&mode=&trade=FIX_PRICE&isCx=&currentPage=10000'
    simplehttp.GET(url, {}, function (error, response, body) {
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
    loopNewTransfer_mobile(callback);
    // if (isDetecting) return;

    // detectLastProductId(function(productId) {
    //     logutil.info("detected latest id", productId)

    //     loopNewTransfer_browser(productId, function(product) {
    //         return callback(product);
    //     })

    // })
}

function randomNumber() {
    return Math.round(Math.random() * 100000);
}

function loopNewTransfer_browser(startId, callback) {
    if (this.loopjob) {
        if (!this.loopjob.isLoopingStarted()) {
            this.loopjob.startLooping();
        }
        logutil.info("loopNewTransfer loopjob existed");
        return;
    }
    var lastDetectTime = lastIncTime = new Date();

    var latestConsumedProductId = 0;
    var productId = Number(startId);
    var productIdStart = productId;
    var LOOP_INTERVAL = 1800;
    var loopjob = new LoopJob().config({
        parallelRequests: 1,
        //url: "https://list.lu.com/list/service/product/*/productDetail",
        url: "https://list.lu.com/list/productDetail?productId=*",
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8 * LOOP_INTERVAL,
        httpMethod: "GET",
        urlInjection: function (parallelIndex, url) {
            if (productId - productIdStart > 50) {
                logutil.info("***productId rolling", productId);
                productIdStart = productId;
            }
            //31551142, 31551143 31642122
            var u = url.replace("*", productId + parallelIndex); //+ "?_=" + new Date().getTime();
            //var u = url.replace("*", "31642122");
            return u;
        },
        responseHandler: function (error, response, body) {
            if (error) {
                logutil.info("responseHandler error:" + error, productId)
            } else if (response.statusCode == 200) {
                var req = response.request;

                var catchException;
                try {
                    var productObj = parseProductPage(body) // JSON.parse(body);
                    if (productObj.productId && productObj.productId > latestConsumedProductId) {
                        lastIncTime = lastDetectTime = new Date();
                        if (productObj.productStatus === "DONE") logutil.info("productStatus", productObj.productId, productObj.productStatus, productObj.price, productObj.interestRateDisplay, productObj.publishedAtDateTime)

                        if (productObj.productType === "TRANSFER_REQUEST" && productObj.tradingMode === "00" && productObj.productStatus === "ONLINE") {
                            callback({
                                productId: productObj.productId,
                                interest: productObj.interestRateDisplay,
                                price: productObj.price,
                                publishTime: productObj.publishedAtDateTime,
                                source: "www.lu.com",
                                producedTime: new Date()
                            });

                            latestConsumedProductId = productObj.productId;

                            //if (productObj.price < 5000)
                            logutil.info("consume productStatus", productObj.publishedAtDateTime, new Date(), productObj.productId, productObj.productStatus,
                                productObj.tradingMode, productObj.price, productObj.interestRateDisplay)

                        } else {
                            //logutil.info("productStatus", productObj.publishedAtDateTime, productObj.productId, productObj.productStatus, productObj.tradingMode)
                        }

                        if (productObj.productId >= productId) {
                            productId = productObj.productId + 1;
                            //logutil.info("------>", productId, productObj.price, productObj.interestRateDisplay)
                        }

                    } else {
                        if (body.indexOf('id="current-page" type="hidden" value="login"') > 0 || body.indexOf('项目信息已变更') > 0) {
                            //latestConsumedProductId = productId;
                            lastIncTime = lastDetectTime = new Date();

                            //console.log("----------------------======", productId, body.indexOf('id="current-page" type="hidden" value="login"') > 0, new Date())
                            productId += 1;

                        } else {
                            productObj = { productId: 0 };
                            //console.log("productId---------------------", productId, latestConsumedProductId, productObj)
                        }
                    }
                } catch (e) {
                    catchException = e;
                    logutil.error("e", e.stack)
                    // logutil.info(body)    
                } finally {
                    //console.log("-----------------------------------------------finally", productId, productObj.productId, new Date() - lastDetectTime)

                    if (catchException || productObj.productId === 0) {
                        var sincelastdetect = new Date() - lastDetectTime;
                        var sincelastinc = new Date() - lastIncTime;
                        if (sincelastdetect > 300000) {
                            lastDetectTime = new Date();
                            detectLastProductId(function (lastProductId) {
                                logutil.info("update last product id =====", lastProductId, productId)
                                if (lastProductId > productId) {
                                    productId = lastProductId;
                                    logutil.info("update last product id ==========================", productId, lastProductId > productId)
                                }
                            });
                        } else if (sincelastinc > 30000) {
                            productId++;
                            lastIncTime = new Date();
                            console.log("auto inc", productId, new Date())
                        }
                    }
                }
            } else {
                if (response.statusCode !== 423)
                    logutil.error("?????????????????????????????? statusCode:", response.statusCode, productId)
            }

        }
    });

    loopjob.startLooping();
    me.loopjob = loopjob;
}

function parseProductPage(body) {

    var productObj = {};
    var productId = htmlparser.getValueFromBody('="productId" value="', '"', body);

    if (!productId) {
        return productObj;
    }
    productObj.productId = Number(productId);

    var intereststr = htmlparser.getValueFromBody('<p class="p1">预期年化利率</p>', '</strong>', body);
    var intrest = htmlparser.getValueFromBody('<strong>', '%', intereststr);
    productObj.interestRateDisplay = Number(intrest) / 100;

    var price = htmlparser.getValueFromBody('price="', '"', body);
    productObj.price = Number(price);

    var publishedAtDateTime = htmlparser.getValueFromBody('发布时间：', '\n', body);
    productObj.publishedAtDateTime = publishedAtDateTime;

    var status = htmlparser.getValueFromBody('product-status="', '"', body);
    productObj.productStatus = status;

    productObj.productType = "TRANSFER_REQUEST";
    productObj.tradingMode = "00";
    return productObj;
}

function loopNewTransfer_mobile(callback) {
    if (me.loopjob) {
        if (!me.loopjob.isLoopingStarted()) {
            me.loopjob.startLooping();
        }
        logutil.info("loopNewTransfer loopjob existed");
        return;
    }
    var filterEndTransPrice = 0.7;
    var jobStartTime = new Date();
    console.log("job start", jobStartTime)
    var requestCount = 0;
    var consumedProducts = {};
    var LOOP_INTERVAL = 2000;
    var loopjob = new LoopJob().config({
        parallelRequests: 1,
        url: "https://ma.lu.com/mapp/service/public?M3024&listType=trans_p2p",
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8 * LOOP_INTERVAL,
        httpMethod: "POST",
        urlInjection: function (parallelIndex, url) {
            url += ("?_" + randomNumber());
            return url;
        },
        optionsInjection: function (parallelIndex, options) {
            requestCount++;
            if (requestCount % 100 === 0) console.log("requestCount", requestCount, new Date());
            options.form = {
                requestCode: "M3024",
                version: "3.4.9",
                //{"cookieUserName":"MjAyMDk2RjZGN0IyNDc2OUZCNzRGQTNDMDQ2RTlBNTk=","readListType":"trans_p2p","filterBeginInvestPeriodInDay":"10","width":720,"listType":"trans_p2p","pageSize":"15","ver":"1","isForNewUser":"false","forNewUser":"false","pageIndex":"1","filterEndTransPrice":"0.65","source":"android","filterBeginTransPrice":"0.2","currentPage":"1"}
                params: '{"cookieUserName":"","readListType":"trans_p2p","filterBeginInvestPeriodInDay":"10","width":720,"listType":"trans_p2p","pageSize":"15","ver":"1","isForNewUser":"false","productSortType":"INTEREST_RATE_DESC","forNewUser":"false","pageIndex":"1","filterEndTransPrice":"' + filterEndTransPrice + '","source":"android","filterBeginTransPrice":"0.2","currentPage":"1"}'
            };
            options.headers = {
                "mobile_agent": "appVersion:3.4.9,platform:android,osVersion:17,device:GT-P5210,resourceVersion:2.7.0,channel:H5",
                "X-LUFAX-MOBILE-DATA-AGENT": '',
                "x-lufax-mobile-t": '',
                "x-lufax-mobile-signature": ''
            }
            return options;
        },
        responseHandler: function (error, response, body) {

            if (error) {
                //logutil.info("responseHandler error:", new Date(), error)
            } else if (response.statusCode == 200) {
                var req = response.request;
                var catchException;
                try {
                    var bodyJson = JSON.parse(body);
                    if (!bodyJson.result.products) {
                        console.log(new Date(), "*******", requestCount, body)
                        loopjob.pause(1200000, "wait for network recover");
                        pppoeutil.pppoeUpdate(function (succeed) {
                            if (succeed) loopjob.pause(0, "network recover, stop pause");
                            else loopjob.pause(20*60*1000);
                        })
                        return;

                    } else {
                        //console.log(bodyJson.result.totalCount, new Date())
                    }

                    var productObjs = bodyJson.result.products[0].productList;
                    var products = [];
                    for (var i = 0; i < productObjs.length; i++) {
                        var item = productObjs[i];
                        if (!consumedProducts[item.id]) {
                            console.log("*******************product:", item.id, item.price, item.principal, item.interestRate, item.numOfInstalments, item.publishedAt,new Date().toLocaleTimeString(), "totalCount", bodyJson.result.totalCount);
                            products.push({
                                productId: item.id,
                                productCategory: item.productCategory,
                                interest: Number(item.interestRate),
                                productType: item.productType,
                                productStatus: item.productStatus,
                                tradingMode: item.tradingMode,
                                price: item.price,
                                reducePrice: Number(item.extReducePrice),
                                publishTime: item.publishedAt,
                                numOfInstalments: item.numOfInstalments,
                                source: "www.lu.com",
                                producedTime: new Date()
                            });
                        }
                    }

                    //"},{"id":138988453,"price":6952.88,"principal":6941.54,"interestRate":"0.084","numOfInstalments":24,"sourceId":151450837,"publishedAt":"Jan 11, 2017 12:08:55 PM","code":"17011132696","productType":"TRANSFER_REQUEST","productStatus":"ONLINE","collectionMode":"1","tradingMode":"00","mgmtFeeRate":0,"feeDisplayFlag":"false","extOnlineDianjinCount":0,"sourceType":"9","maxInvestAmount":6952.88,"minInvestAmount":6952.88,"remainingAmount":6952.88,"raisedAmount":0,"investPeriod":"24","investPeriodUnit":"3","displayName":"稳盈-安e","trxEndAt":"Jan 12, 2017 12:08:55 PM","sellerUserId":18806205,"transferFee":13.9,"riskLevel":"1","salesChannel":"0","isCuxiao":"0","isForNewUser":"0","isForDefault":"1","minInterestRate":"0","createdAt":"Jan 11, 2017 12:08:55 PM","updatedAt":"Jan 11, 2017 4:01:23 PM","productCategory":"901","interestRateDisplay":"8.40%","listTypeName":"转让专区","listType":"p2p_transfer","extUserGroupList":["DEFAULT"],"extInvestPeriodDisplay":"24个月","extCurrentPrice":6952.88,"extIsVipGroup":false,"extIsSpecialGroup":false,"extCanWithHold":false,"extRiskLevelDisplayName":"保守型","extProgress":0.00,"extInvestAmoutUnitDisplay":"元","extPromotionDisplay":"","extProductNameDisplay":"稳盈-安e 17011132696","extInterestRateDisplay":"8.40%","remainingTransferDays":"5","isOverdueTransfer":"0","productPropDtoList":[],"interestRateDesc":"期望年化利率","subProductCategory":"3","extReducePriceDays":"0.0","extReducePrice":"0.00","transferCutRate":"0","extReducePriceDisplay":"转让人已降价0.00% (0.00元)","extProductLineNewUser":false,"extForCarOwner":false,"extTransferPriceDisplay":"转让价格(元)","lastCollectionDate":"Jan 5, 2019 11:59:59 PM","nextCollectionDate":"Feb 5, 2017 11:59:59 PM","extIsShowProgress":"0","extMinInvestAmountDisplay":"6952.88"},{"
                    
                    if (products.length > 0) {
                        callback(products);
                        products.forEach(function(prd){
                            if (prd.consumed) consumedProducts[prd.productId] = true;
                        })
                    }
                } catch (e) {
                    catchException = e;
                    logutil.info("e", e.stack)

                } finally {

                }
            } else {
                logutil.info("?????????????????????????????? statusCode:", response.statusCode)
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
    logutil.info("pauseNewTransferLoop... lufax", msc);
    this.loopjob.pause(msc);
}

exports.stopNewTransferLoop = stopNewTransferLoop;

function stopNewTransferLoop() {
    logutil.info("stopNewTransferLoop... lufax");
    this.loopjob.stopLooping();
}

function getProductsDetail(index, products) {
    var product = products[index];

    var url = "http://list.lu.com/list/productDetail?productId=" + product.productId;
    simplehttp.GET(url, {}, function (error, response, body) {

        try {
            var principal = htmlparser.getValueFromBody('<td><strong>', ' 元', htmlparser.getValueFromBody('<td>项目本金：</td>', '</strong></td>', body)).replace(',', '');
            product.principal = Number(principal);
        } catch (e) {
            logutil.error("----", body.indexOf('<td>项目本金：</td>'), product)
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
