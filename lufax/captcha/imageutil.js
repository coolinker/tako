var BACKGROUND_COLOR = 255;
var HOLLOW_PIXELS_MAX_NUM = 10;
function arrayConcat(arr0, arr1) {
    for (var i=0; i<arr1.length; i++) {
        arr0.push(arr1[i]);
    }
}
exports.arrayConcat = arrayConcat;

function getXByIndex(imageData, idx) {
    return (idx%(imageData.width*4))/4;
}
exports.getXByIndex = getXByIndex;

function getYByIndex(imageData, idx) {
    return Math.floor(idx/(imageData.width*4))
}
exports.getYByIndex = getYByIndex;


function degradeColor(color, unit){
    return Math.round(color/unit)*unit;
}
exports.degradeColor = degradeColor;

function getFirstPixelInDirection(imageData, fromIslet, toIslet, i, h, v) {
    var x = getXByIndex(imageData, i);
    var y = getYByIndex(imageData, i);
    var len = 0;
    for (var n=0; ;n++) {
        var nx = x+n*h;
        if (nx<0||nx>imageData.width-1) return Infinity;

        var ny = y+n*v;
        if (ny<0||ny>imageData.height-1) return Infinity;
        
        var ni = nx*4 + ny*imageData.width*4;
        len++;
        if (fromIslet[ni] !== undefined) len = 0;
        if (toIslet[ni] !== undefined) {
            return len;
        }
    }

}

function getIsletsMinDistance(imageData, islet, main) {
    var minlen = Infinity;
    var count = 0;
    for (var i in islet) {count++}

    for (var i in islet) {
        var idx = islet[i];
        var lefti = getNeighbourPixelIndex(imageData, idx, -1, 0);
        if (main[lefti] !== undefined) return 0;
        if (isPixelWhite(imageData, lefti)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, -1, 0);
            minlen = Math.min(minlen, len);
        }
        // if (count === 5) console.log("------------lefti", getXByIndex(imageData, idx), getYByIndex(imageData, idx), minlen)
        var righti = getNeighbourPixelIndex(imageData, idx, 1, 0);
        if (main[righti] !== undefined) return 0;
        if (isPixelWhite(imageData, righti)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, 1, 0);
            minlen = Math.min(minlen, len);
        }
        
        var upi = getNeighbourPixelIndex(imageData, idx, 0, -1);
        // console.log("------------upi",getYByIndex(imageData, i), upi, imageData.data[upi], main[upi])
        if (main[upi] !== undefined) return 0;
        if (isPixelWhite(imageData, upi)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, 0, -1);
            minlen = Math.min(minlen, len);
        }
// if (count === 5) console.log("------------upi", minlen)
        var downi = getNeighbourPixelIndex(imageData, idx, 0, 1);
        if (main[downi] !== undefined) return 0;
        if (isPixelWhite(imageData, downi)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, 0, 1);
            minlen = Math.min(minlen, len);
        }
// if (count === 5) console.log("------------downi", minlen)
        var uplefti = getNeighbourPixelIndex(imageData, idx, -1, -1);
        if (main[uplefti] !== undefined) return 0;
        if (isPixelWhite(imageData, uplefti)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, -1, -1);
            minlen = Math.min(minlen, len);
        }
// if (count === 5) console.log("------------upleft", minlen)
        var uprighti = getNeighbourPixelIndex(imageData, idx, 1, -1);
        if (main[uprighti] !== undefined) return 0;
        if (isPixelWhite(imageData, uprighti)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, 1, -1);
            minlen = Math.min(minlen, len);
        }
        // if (count === 5) console.log("------------uprighti", minlen)
        var downlefti = getNeighbourPixelIndex(imageData, idx, -1, 1);
        if (main[downlefti] !== undefined) return 0;
        if (isPixelWhite(imageData, downlefti)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, -1, 1);
            minlen = Math.min(minlen, len);
        }
        // if (count === 5) console.log("------------downlefti", minlen)
        var downrighti = getNeighbourPixelIndex(imageData, idx, 1, 1);
        if (main[downrighti] !== undefined) return 0;
        if (isPixelWhite(imageData, downrighti)) {
            var len = getFirstPixelInDirection(imageData, islet, main, idx, 1, 1);
            minlen = Math.min(minlen, len);
        }
        // if (count === 5) console.log("------------downrighti", minlen)

    }

    return minlen;
}
exports.getIsletsMinDistance = getIsletsMinDistance;

function getColorPIxelNumber(imageData){
    var totalPixelNumber = 0;
    for (var idx = 0; idx < imageData.data.length; idx += 4) {
        if (!isPixelWhite(imageData, idx)) {
            totalPixelNumber++;
        }
    }
    return totalPixelNumber;
}
exports.getColorPIxelNumber = getColorPIxelNumber;

function setPixelColorByIndex(imageData, i, r, g, b) {
    imageData.data[i] = r;
    imageData.data[i + 1] = g;
    imageData.data[i + 2] = b;
}
exports.setPixelColorByIndex = setPixelColorByIndex;

function setPixelColor(imageData, x, y, r, g, b) {
    var i = x * 4 + y * 4 * imageData.width;
    imageData.data[i] = r;
    imageData.data[i + 1] = g;
    imageData.data[i + 2] = b;
}
exports.setPixelColor = setPixelColor;

function setColorsInDirection(imageData, start, end, h, v, r, g, b, conditionFun) {
    var x = (start%(imageData.width*4))/4;
    var y = Math.floor(start/(imageData.width*4));
    for (var i=0; ;i++) {
        var nx = x + i*h;
        var ny = y+ i*v;
        if (nx>imageData.width-1 || nx<0 || ny>imageData.height-1 || ny<0)  break;
        var idx = 4*nx+imageData.width*4*ny;
        if (conditionFun===undefined || conditionFun(idx)) {
            setPixelColor(imageData, nx, ny, r, g, b);
        }
        if (idx === end) break;
    }

}
exports.setColorsInDirection = setColorsInDirection;
function inBlackWhilte(img, _pmap) {
    for (var _att in _pmap) {
        var _pi = _pmap[_att];
        var _d = getNeighbourPixelIndex(img, _pi, 0, 1);
        if (_pmap[_d] === undefined && !isPixelBlackOrWhite(img, _d)) return false;
        var _u = getNeighbourPixelIndex(img, _pi, 0, -1); 
        if (_pmap[_u] === undefined && !isPixelBlackOrWhite(img, _u)) return false;
        var _rd = getNeighbourPixelIndex(img, _pi, 1, 1); 
        if (_pmap[_rd] === undefined && !isPixelBlackOrWhite(img, _rd)) return false;
        var _ld = getNeighbourPixelIndex(img, _pi, -1, 1); 
        if (_pmap[_ld] === undefined && !isPixelBlackOrWhite(img, _ld)) return false;
        var _lu = getNeighbourPixelIndex(img, _pi, -1, -1); 
        if (_pmap[_lu] === undefined && !isPixelBlackOrWhite(img, _lu)) return false;
        var _ru = getNeighbourPixelIndex(img, _pi, 1, -1); 
        if (_pmap[_ru] === undefined && !isPixelBlackOrWhite(img, _ru)) return false;
    }

    return true;
}
exports.inBlackWhilte = inBlackWhilte;

function getFirstBackgroundColorIndex(imageData, idx, h, v) {
    for (var i=1; ; i++) {
        var x = (idx % (4 * imageData.width)) / 4 + i*h;
        var y = Math.floor(idx / (4 * imageData.width)) + i*v;
        if (x<0 || y<0 || x>= imageData.width || y>= imageData.height) break;

        var nextidx = x*4+y*4*imageData.width;
        var r = imageData.data[nextidx];
        var g = imageData.data[nextidx];
        var b = imageData.data[nextidx];
        
        if (r===BACKGROUND_COLOR && g===BACKGROUND_COLOR && b===BACKGROUND_COLOR) return nextidx;
    }

    return -1;
}
exports.getFirstBackgroundColorIndex = getFirstBackgroundColorIndex;


function getFirstDiffColorIndex(imageData, idx, h, v) {
    var r = imageData.data[idx];
    var g = imageData.data[idx+1];
    var b = imageData.data[idx+2];
    for (var i=1; ; i++) {
        var x = (idx % (4 * imageData.width)) / 4 + i*h;
        var y = Math.floor(idx / (4 * imageData.width)) + i*v;
        if (x<0 || y<0 || x>= imageData.width || y>= imageData.height) break;

        var nextidx = x*4+y*4*imageData.width;
        var _r = imageData.data[nextidx];
        var _g = imageData.data[nextidx];
        var _b = imageData.data[nextidx];
        
        if (r!==_r || g!==_g || b!==_b) return nextidx;
    }

    return -1;
}
exports.getFirstDiffColorIndex = getFirstDiffColorIndex;

function getNeighbourPixelColor(imageData, idx, hdirection, vdirection) {
    var nidx = getNeighbourPixelIndex(imageData, idx, hdirection, vdirection);
    return nidx >= 0 ? imageData.data[nidx] : null;
}
exports.getNeighbourPixelColor = getNeighbourPixelColor;

function getNeighbourPixelIndex(imageData, idx, hdirection, vdirection) {
    var x = (idx % (4 * imageData.width)) / 4;
    var y = Math.floor(idx / (4 * imageData.width));

    var newx = x + hdirection;
    var newy = y + vdirection;
    if (newx < 0 || newx >= imageData.width || newy < 0 || newy >= imageData.height) return -1;
    return newx * 4 + newy * 4 * imageData.width;
}
exports.getNeighbourPixelIndex = getNeighbourPixelIndex;

function makeSingleColor(imageData, color) {
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== 255 || imageData.data[i+1] !== 255
                || imageData.data[i+2] !== 255) {
                imageData.data[i] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
                imageData.data[i + 3] = 255;
            }

        }
    }
}
exports.makeSingleColor = makeSingleColor;

function getPixelAveX(imageData) {
    var count = 0, sumx = 0;
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR || imageData.data[i+1] !== BACKGROUND_COLOR
                || imageData.data[i+2] !== BACKGROUND_COLOR) {
                sumx+=x;
                count++;
            }

        }
    }

    return sumx/count;
}
exports.getPixelAveX = getPixelAveX;
function getPixelAveY(imageData) {
    var count = 0, sumy = 0;
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR || imageData.data[i+1] !== BACKGROUND_COLOR
                || imageData.data[i+2] !== BACKGROUND_COLOR) {
                sumy+=y;
                count++;
            }

        }
    }

    return sumy/count;
}
exports.getPixelAveY = getPixelAveY;
function grayImageData(imageData) {
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            var luma = Math.floor(imageData.data[i] * 299 / 1000 +
                imageData.data[i + 1] * 587 / 1000 +
                imageData.data[i + 2] * 114 / 1000);

            imageData.data[i] = luma;
            imageData.data[i + 1] = luma;
            imageData.data[i + 2] = luma;
            imageData.data[i + 3] = 255;
        }
    }
}
exports.grayImageData = grayImageData;

function isPixelBlackOrWhite(imageData, i) {
    return isPixelWhite(imageData, i) || isPixelBlack(imageData, i)
}
exports.isPixelBlackOrWhite = isPixelBlackOrWhite;

function isPixelWhite(imageData, i) {
    var r = imageData.data[i];
    var g = imageData.data[i + 1];
    var b = imageData.data[i + 2];
    return (r === BACKGROUND_COLOR && g === BACKGROUND_COLOR && b === BACKGROUND_COLOR);
}
exports.isPixelWhite = isPixelWhite;

function isPixelBlack(imageData, i) {
    var r = imageData.data[i];
    var g = imageData.data[i + 1];
    var b = imageData.data[i + 2];
    return (r === 0 && g === 0 && b === 0);
}
exports.isPixelBlack = isPixelBlack;

function getSubImage(imageData, pixelMap) {
    var map = {};
    if (pixelMap instanceof Array) {
        for (var i=0; i<pixelMap.length; i++) {
            map[pixelMap[i]] = pixelMap[i];
        }

        pixelMap = map;
    }

    var newImage = {
        width: imageData.width,
        height: imageData.height,
        data: []
    };
    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (pixelMap[i] !== undefined) {
                newImage.data.push(imageData.data[i]);
                newImage.data.push(imageData.data[i + 1]);
                newImage.data.push(imageData.data[i + 2]);
                newImage.data.push(imageData.data[i + 3]);
            } else {
                newImage.data.push(255);
                newImage.data.push(255);
                newImage.data.push(255);
                newImage.data.push(255);
            }

        }
    }
    return newImage;
}
exports.getSubImage = getSubImage;

function getIslets(imageData, size) {
    var islets = [];
    var detectedMap = {};
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (isPixelWhite(imageData, i) || detectedMap[i] != undefined) continue;

            var clrMap = {};
            var count =  detectIslet(imageData, x, y, clrMap, detectedMap);
            // for (var att in clrMap) {
            //     detectedMap[att] = clrMap[att];
            //     count++;
            // }
            if (count<size) islets.push(clrMap);
        }
    }

    return islets;
}
exports.getIslets = getIslets;
function detectIslet(imageData, x, y, nbrsMap, nbrsMap1) {
    var p = x * 4 + y * 4 * imageData.width;
    var count = 0;
    if (!isPixelWhite(imageData, p)) {
        nbrsMap[p] = nbrsMap1[p] = p;
        count++;
    } else {
        console.log("ERROR: detectIslet", x, y, p, nbrsMap[p], imageData.data[p])
        return;
    }

    var isletPixels  = [p];
    var lf = [], rt = [], up = [], dn = [];

    var fun = function(pidx) {
         if (!nbrsMap[pidx] && !isPixelWhite(imageData, pidx)) {
            nbrsMap[pidx] = nbrsMap1[pidx] = pidx;
            isletPixels.push(pidx);
            count++;
        }
    }

    while(isletPixels.length>0) {
        p = isletPixels.pop();
        var lp = getNeighbourPixelIndex(imageData, p, -1, 0);
        fun(lp);
        var rp = getNeighbourPixelIndex(imageData, p, 1, 0);
        fun(rp);
        var up = getNeighbourPixelIndex(imageData, p, 0, -1);
        fun(up);
        var dp = getNeighbourPixelIndex(imageData, p, 0, 1);
        fun(dp);
    } 

    return count;
}

function detectIslet1(imageData, x, y, nbrsMap) {
    
    var p = x * 4 + y * 4 * imageData.width;
    if (undefined === nbrsMap[p] && imageData.data[p] !== BACKGROUND_COLOR) {
        nbrsMap[p] = p;
    } else {
        console.log("ERROR: detectIslet", x, y, p, nbrsMap[p], imageData.data[p])
        return;
    }
    var up = getNeighbourPixelIndex(imageData, p, 0, -1);
    var down = getNeighbourPixelIndex(imageData, p, 0, 1);
    
    var left = getNeighbourPixelIndex(imageData, p, -1, 0);
    var right = getNeighbourPixelIndex(imageData, p, 1, 0);
    
    if((up<0 || down<0) && (left<0 || right<0)) return;
    // var upleft = getNeighbourPixelIndex(imageData, p, -1, -1);
    // var upright = getNeighbourPixelIndex(imageData, p, 1, -1);
    // var downright = getNeighbourPixelIndex(imageData, p, 1, 1);
    // var downleft = getNeighbourPixelIndex(imageData, p, -1, 1);

    if (up >= 0 && undefined === nbrsMap[up] && imageData.data[up] !== BACKGROUND_COLOR) {
        detectIslet(imageData, x, y - 1, nbrsMap);
    }

    if (down >= 0 && undefined === nbrsMap[down] && imageData.data[down] !== BACKGROUND_COLOR) {
        detectIslet(imageData, x, y + 1, nbrsMap);
    }

    if (left >= 0 && undefined === nbrsMap[left] && imageData.data[left] !== BACKGROUND_COLOR) {
        detectIslet(imageData, x - 1, y, nbrsMap);
    }

    if (right >= 0 && undefined === nbrsMap[right] && imageData.data[right] !== BACKGROUND_COLOR) {
        detectIslet(imageData, x + 1, y, nbrsMap);
    }

    // if (upleft >= 0 && undefined === nbrsMap[upleft] && imageData.data[upleft] !== BACKGROUND_COLOR) {
    //     detectIslet(imageData, x - 1, y - 1, nbrsMap);
    // }

    // if (upright >= 0 && undefined === nbrsMap[upright] && imageData.data[upright] !== BACKGROUND_COLOR) {
    //     detectIslet(imageData, x + 1, y - 1, nbrsMap);
    // }

    // if (downright >= 0 && undefined === nbrsMap[downright] && imageData.data[downright] !== BACKGROUND_COLOR) {
    //     detectIslet(imageData, x + 1, y + 1, nbrsMap);
    // }

    // if (downleft >= 0 && undefined === nbrsMap[downleft] && imageData.data[downleft] !== BACKGROUND_COLOR) {
    //     detectIslet(imageData, x - 1, y + 1, nbrsMap);
    // }

}
exports.detectIslet = detectIslet;

function pixelRange(imageData) {
    var left = Infinity,
        right = -1,
        top = Infinity,
        bottom = -1;
    for (var i=0; i<imageData.data.length; i+=4) {
        if (imageData.data[i] === BACKGROUND_COLOR 
            && imageData.data[i+1] === BACKGROUND_COLOR 
            && imageData.data[i+2] === BACKGROUND_COLOR) {
            continue;
        }

        var x = (i % (4 * imageData.width)) / 4;
        var y = Math.floor(i / (4 * imageData.width));
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
    }

    return {left:left, right:right, top:top, bottom:bottom};
}
exports.pixelRange = pixelRange;

function removeSubImage(imageData, sub, color) {
    if (color===undefined) color = BACKGROUND_COLOR;
    for (var y = 0; y < sub.height; y++) {
        for (var x = 0; x < sub.width; x++) {
            var i = x * 4 + y * 4 * sub.width;
            if (sub.data[i] !== BACKGROUND_COLOR || sub.data[i+1] !== BACKGROUND_COLOR || sub.data[i+2] !== BACKGROUND_COLOR) {
                    imageData.data[i] = color;
                    imageData.data[i+1] = color;
                    imageData.data[i+2] = color;
            }
        }
    }
}
exports.removeSubImage = removeSubImage;

function removePixelColor(imageData, pixelMap, alpha) {
    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (pixelMap[i] !== undefined) {
                if (alpha === true) {
                    imageData.data[i] = 0;
                    imageData.data[i+1] = 0;
                    imageData.data[i+2] = 0;
                    // imageData.data[i+3] = 0; 
                } else {
                    imageData.data[i] = BACKGROUND_COLOR;
                    imageData.data[i+1] = BACKGROUND_COLOR;
                    imageData.data[i+2] = BACKGROUND_COLOR;
                }
            }
        }
    }
}
exports.removePixelColor = removePixelColor;

function removePadding(imageData) {
    var range = pixelRange(imageData);
    var left = range.left;
    var right = range.right;
    var top = range.top;
    var bottom = range.bottom;

    var newImage = {width: right-left+1, height: bottom-top+1, data:[]};
    for (var y = 0; y < newImage.height; y++) {
        for (var x = 0; x < newImage.width; x++) {
            var i = (x+left) * 4 + (y+top) * 4 * imageData.width;
            if (imageData.data[i]!==BACKGROUND_COLOR
                || imageData.data[i+1]!==BACKGROUND_COLOR
                || imageData.data[i+2]!==BACKGROUND_COLOR) {
                newImage.data.push(imageData.data[i]);
                newImage.data.push(imageData.data[i+1]);
                newImage.data.push(imageData.data[i+2]);
                newImage.data.push(imageData.data[i+3]);
            } else {
                newImage.data.push(255);
                newImage.data.push(255);
                newImage.data.push(255);
                newImage.data.push(255);
            }
            
        }
    }
    // console.log("newImage", newImage.width, newImage.height);
    return newImage;
}
exports.removePadding = removePadding;

function scale(imageData, width, height) {
    var ratio;
    if (imageData.width/width > imageData.height/height) {
        ratio = imageData.width/width;
        height = Math.round(imageData.height/ratio);
    } else {
        ratio = imageData.height/height;
        width = Math.round(imageData.width/ratio);
    }
    var newImage = {width:width, height:height, data:[]};
    for (var y = 0; y < newImage.height; y++) {
        for (var x = 0; x < newImage.width; x++) {
            var si = Math.round(x * ratio) * 4 + Math.round(y * ratio) * 4 * imageData.width;
            newImage.data.push(imageData.data[si]);
            newImage.data.push(imageData.data[si+1]);
            newImage.data.push(imageData.data[si+2]);
            newImage.data.push(imageData.data[si+3]);
        }
    }
    return newImage;
}
exports.scale = scale;


function fillHollow(imageData) {
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR) continue;
            var lclr = getNeighbourPixelColor(imageData, i, -1, 0);
            var rclr = getNeighbourPixelColor(imageData, i, 1, 0);
            var tclr = getNeighbourPixelColor(imageData, i, 0, -1);
            var bclr = getNeighbourPixelColor(imageData, i, 0, 1);
            if (lclr !== BACKGROUND_COLOR && lclr === tclr || lclr !== BACKGROUND_COLOR && lclr === bclr || rclr !== BACKGROUND_COLOR && rclr === tclr || rclr !== BACKGROUND_COLOR && rclr === bclr) {
                var pixels = {};
                if (detectHollow(imageData, i, pixels)) {
                    for (var att in pixels) {
                        var _i = pixels[att];
                        imageData.data[_i] = 0;
                        imageData.data[_i + 1] = 0;
                        imageData.data[_i + 2] = 0;
                    }
                }
            }
        }
    }    
}
exports.fillHollow = fillHollow;

function detectHollow(imageData, p, pixels) {
    var count = 0;
    for (var att in pixels) {
        count++;
    }
    if (count > HOLLOW_PIXELS_MAX_NUM) return false;

    pixels[p] = p;
    var lp = getNeighbourPixelIndex(imageData, p, -1, 0);
    if (lp >= 0 && !pixels[lp] && imageData.data[lp] === BACKGROUND_COLOR) {
        var h = detectHollow(imageData, lp, pixels);
        if (h === false) return false;
    }

    var rp = getNeighbourPixelIndex(imageData, p, 1, 0);
    if (rp >= 0 && !pixels[rp] && imageData.data[rp] === BACKGROUND_COLOR) {
        var h = detectHollow(imageData, rp, pixels);
        if (h === false) return false;
    }
    var tp = getNeighbourPixelIndex(imageData, p, 0, -1);
    if (tp >= 0 && !pixels[tp] && imageData.data[tp] === BACKGROUND_COLOR) {
        var h = detectHollow(imageData, tp, pixels);
        if (h === false) return false;
    }
    var bp = getNeighbourPixelIndex(imageData, p, 0, 1);
    if (bp >= 0 && !pixels[bp] && imageData.data[bp] === BACKGROUND_COLOR) {
        var h = detectHollow(imageData, bp, pixels);
        if (h === false) return false;
    }

    return true;
}
exports.detectHollow = detectHollow;

function getIsletBorders(imageData, islet) {
    var borders = {left:Infinity, right:0, top:Infinity, bottom:0}
    for (var att in islet) {
        var i = islet[att];
        var x = (i % (4 * imageData.width)) / 4;
        var y = Math.floor(i / (4 * imageData.width));
        borders.left = Math.min(borders.left, x);
        borders.top = Math.min(borders.top, y);
        borders.right = Math.max(borders.right, x);
        borders.bottom = Math.max(borders.bottom, y);

    }
    return borders;
}
exports.getIsletBorders = getIsletBorders;

function isThinPixel(idx, imageData) {
    var left = getNeighbourPixelIndex(imageData, idx, -1, 0);
    var right = getNeighbourPixelIndex(imageData, idx, 1, 0);
    if (imageData.data[left] === BACKGROUND_COLOR && imageData.data[left+1] === BACKGROUND_COLOR && imageData.data[left+2] === BACKGROUND_COLOR
        &&imageData.data[right] === BACKGROUND_COLOR && imageData.data[right+1] === BACKGROUND_COLOR && imageData.data[right+2] === BACKGROUND_COLOR) {
        return true;
    }

    var up = getNeighbourPixelIndex(imageData, idx, 0, -1);
    var down = getNeighbourPixelIndex(imageData, idx, 0, 1);
    if (imageData.data[up] === BACKGROUND_COLOR && imageData.data[up+1] === BACKGROUND_COLOR && imageData.data[up+2] === BACKGROUND_COLOR
        &&imageData.data[down] === BACKGROUND_COLOR && imageData.data[down+1] === BACKGROUND_COLOR && imageData.data[down+2] === BACKGROUND_COLOR) {
        return true;
    }
       
    return false;
}
exports.isThinPixel = isThinPixel;

function clearIslet(islet, imageData) {
    for (var att in islet) {
        var i = islet[att];

        imageData.data[i] = BACKGROUND_COLOR;
        imageData.data[i + 1] = BACKGROUND_COLOR;
        imageData.data[i + 2] = BACKGROUND_COLOR;
        imageData.data[i + 3] = 255;

    }
}
exports.clearIslet = clearIslet;

function copyImage(imageData) {
    var newImage = {width: imageData.width, height:imageData.height, data:[]};
    for (var i=0; i<imageData.data.length; i++) {
        newImage.data.push(imageData.data[i]);
    }
    return newImage;
}
exports.copyImage = copyImage;

function pixelMap(imageData) {
    var pixels = {}
    for (var i=0; i<imageData.data.length; i+=4) {
        if (!isPixelWhite(imageData, i))
            pixels[i] = i;
    }
    return pixels;
}
exports.pixelMap = pixelMap;

function addToImage(targetImage, sourceImage, pixels) {
    if (pixels === undefined) pixels = pixelMap(sourceImage);
    for (var p in pixels) {
        var i = pixels[p];
        if (isPixelWhite(targetImage, i)) {
            setPixelColorByIndex(targetImage, i, sourceImage.data[i], sourceImage.data[i+1], sourceImage.data[i+2]);
        } else {
            // console.log("addToImage-----------Error: target is not white", getXByIndex(targetImage, i), getYByIndex(targetImage, i));
        }
    }
}
exports.addToImage = addToImage;

function getAngle(h, v) {
    if (h===0 && v===0) return null;
    if (h===0) return v>0 ? Math.PI/2 : Math.PI*3/2;
    if (v===0) return h>0 ? 0 : Math.PI;

    var angle = Math.atan(v/h);
    if (h>0 && v>0) angle = angle;
    else if (h<0 && v>0) angle = Math.PI+angle;
    else if (h<0 && v<0) angle = angle+Math.PI;
    else if (h>0 && v<0) angle = 2*Math.PI+angle;
    return angle;
}

function rangeAfterRotate(imageData, degree) {
    var piv = degree*Math.PI/180;
    var range = pixelRange(imageData);
    var centreX = Math.round((range.left+range.right)/2);
    var centreY = Math.round((range.top+range.bottom)/2);
    var left = imageData.width, right = 0, top = imageData.height, bottom = 0;
    var imgWidth = imageData.width;
    var imgHeight = imageData.height;
    var imageData_data = imageData.data;
    for (var x = 0; x < imgWidth; x++) {
        for (var y = 0; y < imgHeight; y++) {
            var i = x * 4 + y * 4 * imgWidth;
            if (imageData_data[i] === BACKGROUND_COLOR) continue;
            var radius = Math.sqrt(Math.pow(x-centreX, 2) + Math.pow(y-centreY, 2));
            var oriDgr = getAngle((x-centreX), (y-centreY));
            var newx = x, newy = y;
            if (oriDgr !== null) { 
                var hlen = Math.cos(oriDgr+piv)*radius;
                newx = Math.round(centreX+hlen);
                var vlen = Math.sin(oriDgr+piv)*radius;
                newy = Math.round(centreY+vlen);
                // newi = newx*4+newy*imageData.width*4;
            } 

            left = Math.min(newx, left);
            right = Math.max(newx, right);
            top = Math.min(newy, top);
            bottom = Math.max(newy, bottom);
            
        }
    }
    return {left: left, right: right, top: top, bottom: bottom};
}
exports.rangeAfterRotate = rangeAfterRotate;


function rotate(imageData, degree) {
    var piv = degree*Math.PI/180;
    var range = pixelRange(imageData);
    var centreX = Math.round((range.left+range.right)/2);
    var centreY = Math.round((range.top+range.bottom)/2);
    var newImage = copyImage(imageData);
    var newImage_data = newImage.data;
    var newImage_dataLen = newImage_data.length;
    for (var i=0; i<newImage_dataLen; i++) {
        newImage_data[i] = 255;
    }

    var imageWidth = imageData.width;
    var imageHeight = imageData.height;
    var image_data = imageData.data;
    for (var x = 0; x < imageWidth; x++) {
        for (var y = 0; y < imageHeight; y++) {
            var i = x * 4 + y * 4 * imageWidth;
            if (image_data[i] === BACKGROUND_COLOR) continue;
            var radius = Math.sqrt(Math.pow(x-centreX, 2) + Math.pow(y-centreY, 2));
            var oriDgr = getAngle((x-centreX), (y-centreY));
            var newi = i;
            if (oriDgr !== null) { 
                var hlen = Math.cos(oriDgr+piv)*radius;
                var newx = Math.round(centreX+hlen);
                var vlen = Math.sin(oriDgr+piv)*radius;
                var newy = Math.round(centreY+vlen);
                newi = newx*4+newy*imageWidth*4;
            } 

            newImage_data[newi] = image_data[i];
            newImage_data[newi+1] = image_data[i+1];
            newImage_data[newi+2] = image_data[i+2];
            newImage_data[newi+3] = image_data[i+3];
            // console.log(Math.round(radius), centreX, "==", (centreY-y)/(x-centreX), x, newx, "degree", oriDgr, piv, "hlen", hlen);
            // console.log(centreX, centreY, "==", x, newx, "==", y, newy);
            
        }
    }
    imageData.data = newImage.data;
    return imageData;
}
exports.rotate = rotate;

function fillAfterRotate(imageData) {
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR) continue;
            var lefti = getNeighbourPixelIndex(imageData, i, -1, 0);
            var righti = getNeighbourPixelIndex(imageData, i, 1, 0);
            var upi = getNeighbourPixelIndex(imageData, i, 0, -1);
            var downi = getNeighbourPixelIndex(imageData, i, 0, 1);
            if (!isPixelWhite(imageData, lefti) 
                && !isPixelWhite(imageData, righti) 
                && !isPixelWhite(imageData, upi) 
                && !isPixelWhite(imageData, downi)) {
                setPixelColorByIndex(imageData,i, 0, 0, 0)
            }

        }
    }

}
exports.fillAfterRotate = fillAfterRotate;

function getMajorColorKey(imageData) {
    var colorPixels = {};
    var colorKeys = [];
    for (var i = 0; i < imageData.data.length; i += 4) {
        var r = imageData.data[i];
        var g = imageData.data[i + 1];
        var b = imageData.data[i + 2];
        if (r===g && r === b && g === b && (r===0||  r === BACKGROUND_COLOR)) continue;
        
        var key = r + "_" + g + "_" + b;
        if (!colorPixels[key]) {
            colorKeys.push(key);
            colorPixels[key] = [];
        }
        colorPixels[key].push(i);
    }

    colorKeys.sort(function(k1, k2) {
        if (colorPixels[k1].length > colorPixels[k2].length) return -1;
        else if (colorPixels[k1].length < colorPixels[k2].length) return 1;
        else return 0;
    });

    return colorKeys[0];
}
exports.getMajorColorKey = getMajorColorKey;

function move(imageData, h, v) {
    var newImage = copyImage(imageData);
    for (var i=0; i<newImage.data.length; i++) {
        newImage.data[i] = 255;
    }

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] === BACKGROUND_COLOR) continue;
            var newx = x+h;
            var newy = y+v;
            newi = newx*4+newy*imageData.width*4;
            newImage.data[newi] = imageData.data[i];
            newImage.data[newi+1] = imageData.data[i+1];
            newImage.data[newi+2] = imageData.data[i+2];
            newImage.data[newi+3] = imageData.data[i+3];
        }
    }
    imageData.data = newImage.data;
}
exports.move = move;

function moveToCenter(imageData) {
    var range = pixelRange(imageData);

    var h = Math.round(imageData.width/2 - (range.left+(range.right-range.left)/2));
    var v = Math.round(imageData.height/2 - (range.top+(range.bottom-range.top)/2));
    move(imageData, h, v);
}
exports.moveToCenter = moveToCenter;













