var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var htmlparser = require('../htmlparser');
var LoopJob = require("../loopjob");
var me = this;

var MAXMONEY = 10000;
var MINMONEY = 0;
var MINRATE = 0.084;

function detectLastPage(callback) {
    var url = 'http://list.lufax.com/list/transfer/anyi?minMoney=' + MINMONEY + '&maxMoney=' + MAXMONEY + '&minDays=&maxDays=&minRate=' + MINRATE + '&maxRate=0.2&mode=&trade=FIX_PRICE&isCx=&currentPage=10000'
    simplehttp.GET(url, {}, function(error, response, body) {
        
        var no = htmlparser.getValueFromBody('<span class="pagination-no current">', '</span>', body);
        if (no !== null) {
            callback(Number(no));
        } else {
            callback(null);
        }
    });
}

exports.startNewTransferLoop = startNewTransferLoop;

function startNewTransferLoop(callback) {
    var transfers = [];
    detectLastPage(function(lastPage) {
        loopNewTransfer(lastPage, function(products) {
            //callback(products);
            if (products.length > 0) {
                getProductsDetail(0, products, callback)
            }
        })
    })
}


function loopNewTransfer(pageNo, callback) {
    if (this.loopjob) {
        console.log("loopNewTransfer loopjob existed");
        return;
    }

    var lastProductId = 0;
    var lastPageNo = null;
    var loopjob = new LoopJob().config({
        url: 'http://list.lufax.com/list/transfer/anyi?minMoney=' + MINMONEY + '&maxMoney=' + MAXMONEY + '&minDays=&maxDays=&minRate=' + MINRATE + '&maxRate=0.2&mode=&trade=FIX_PRICE&isCx=&currentPage=',
        loopInterval: 1000,
        timeout: 500,
        urlInjection: function(url) {
            if (lastPageNo != pageNo) {
                lastPageNo = pageNo;
                // console.log("pageNo:", lastPageNo, lastProductId);
            }

            return url + pageNo;
        },
        responseHandler: function(error, request, body) {
            if (error) {
                //console.log("loanTransferDetail error:", error)
            } else if (request.statusCode == 200) {
                var isLastPage = body.indexOf('<span class="btns btn_page disabled btn_small next">') > -1;
                var newlineregexp = /\n/g;
                var tzeles = htmlparser.getSubStringsFromBody('<li class="product-list has-bottom clearfix">', 'target="_blank" class="list-btn">', body, newlineregexp);
                // var jpeles = htmlparser.getSubStringsFromBody('<li class="product-list  clearfix  ">', '竞拍</span></a>', body, newlineregexp);
                var products = [];
                var pageUpFlag = true;
                if (!tzeles) {
                    console.log("ERROR:", pageNo, lastProductId)
                }
                for (var i = 0; tzeles && i < tzeles.length; i++) {
                    var priceSection = htmlparser.getValueFromBody('转让价格', '元', tzeles[i]);
                    var prd = {
                        productId: Number(htmlparser.getValueFromBody('<a href=/list/productDetail?productId=', ' target=', tzeles[i])),
                        productType: htmlparser.getValueFromBody('title="', '">', tzeles[i]),
                        interest: Number(htmlparser.getValueFromBody('<p class="num-style">', '%</p>', tzeles[i])) / 100,
                        price: Number(htmlparser.getValueFromBody('<em class="num-style">', '</em>', priceSection).replace(',', '')),
                        source: "www.lufax.com"
                    }
                    if (prd.productId > lastProductId) {
                        products.push(prd);
                        lastProductId = prd.productId;
                    } else {
                        pageUpFlag = false;
                    }

                }

                // for (var i = 0; jpeles && i < jpeles.length; i++) {
                //     var pid = Number(htmlparser.getValueFromBody('<a href=/list/productDetail?productId=', ' target=', jpeles[i]));
                //     if (pid > lastProductId) {
                //         lastProductId = pid;
                //     } else {
                //         pageUpFlag = false;
                //     }

                // }

                if (pageUpFlag) {
                    pageNo--;
                    if (pageNo < 1) pageNo = 1;
                } else if (!isLastPage) {
                    pageNo++;
                }

                if (products.length > 0) callback(products);

            } else {
                console.log("?????????????????????????????? statusCode:", response.statusCode)
            }

        }
    });

    loopjob.startLooping();

    me.loopjob = loopjob;

}

exports.isLoopingStarted = isLoopingStarted;

function isLoopingStarted() {
    return !!this.loopjob;
}

exports.stopNewTransferLoop = stopNewTransferLoop;

function stopNewTransferLoop() {
    logutil.log("stopNewTransferLoop... lufax");
    this.loopjob.stopLooping();
}

function getProductsDetail(index, products, callback) {
    var product = products[index];

    var url = "http://list.lufax.com/list/productDetail?productId=" + product.productId;
    simplehttp.GET(url, {}, function(error, response, body) {

        try {
            var principal = htmlparser.getValueFromBody('<td><strong>', ' 元', htmlparser.getValueFromBody('<td>项目本金：</td>', '</strong></p>', body)).replace(',', '');
            product.principal = Number(principal);
        } catch (e) {
            console.log("----", body.indexOf('<td>项目本金：</td>'), product)
        }


        var trueprice = htmlparser.getValueFromBody('项目价值</span>：', '元', body);
        if (trueprice) {
            trueprice = trueprice.replace(',', '');
            product.truePrice = Number(trueprice);
        }

        callback(product);

        if (index < products.length - 1) {
            getProductsDetail(index + 1, products, callback);
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
