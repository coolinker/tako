var imageUtil = require("./imageutil");

var MINOR_PIXEL_NOISE_LIMIT = 20;
var BACKGROUND_COLOR = 255;
var COLOR_RANGE_OFFSET = 5;
var HOLLOW_PIXELS_MAX_NUM = 20;
var COLOR_ISLET_MAX_NUM = 20;
var DEGRADE_UNIT = 20;
var CHAR_COUNT = 4;
var MINIMUM_CHAR_PIXEL = 250;
var GROUP_COLOR_MIN_DISTANCE = 20;
var COLOR_GROUP_MIN = 100;
exports.config = config;

function config(cfg) {
    if (undefined !== cfg['MINOR_PIXEL_NOISE_LIMIT']) MINOR_PIXEL_NOISE_LIMIT = cfg.MINOR_PIXEL_NOISE_LIMIT;
    if (undefined !== cfg['BACKGROUND_COLOR']) BACKGROUND_COLOR = cfg.BACKGROUND_COLOR;
    if (undefined !== cfg['COLOR_RANGE_OFFSET']) COLOR_RANGE_OFFSET = cfg.COLOR_RANGE_OFFSET;
    if (undefined !== cfg['HOLLOW_PIXELS_MAX_NUM']) HOLLOW_PIXELS_MAX_NUM = cfg.HOLLOW_PIXELS_MAX_NUM;
    if (undefined !== cfg['COLOR_ISLET_MAX_NUM']) COLOR_ISLET_MAX_NUM = cfg.COLOR_ISLET_MAX_NUM;

    return this;
}


exports.getMainColorGroupImages = getMainColorGroupImages;

function getMainColorGroupImages(imageData) {
    degrade(imageData);
    removeBackground(imageData);
    var bgRemovedImage = imageUtil.copyImage(imageData);
    var noiselineimage = removeNoiseLine(imageData);
    // return [imageData]
    var nlRemovedImage = imageUtil.copyImage(imageData);
    removeThinPixels(imageData);
    cutNoiseLine(imageData);
    cutNoiseLine(imageData);
        // return [imageData]
    var imgs = isolatedCharactors(imageData);
        // return imgs;
    if (imgs.length < 4) {
        for (var i = 0; i < imgs.length; i++) {
            var pn = imageUtil.getColorPIxelNumber(imgs[i]);

            if (pn > 1400) {
                var _imgs = splitCharactors(imgs[i]);
                if (_imgs.length === 2) {
                    imgs.splice(i, 1, _imgs[0], _imgs[1]);
                }
            }
        }
    } else if (imgs.length === 5) {
        for (var i = 0; i < imgs.length - 1; i++) {
            var pn0 = imageUtil.getColorPIxelNumber(imgs[i]);
            var pn1 = imageUtil.getColorPIxelNumber(imgs[i + 1]);
            if (pn0 < 1000 || pn1 < 1000) {
                var ck0 = imageUtil.getMajorColorKey(imgs[i]);
                var ck1 = imageUtil.getMajorColorKey(imgs[i + 1]);
                var dist3d = distanceIn3DByColorKey(ck0, ck1);
                // console.log("imgs", pn0, ck0, pn1, ck1, dist3d);
                if (dist3d < 50) {
                    imageUtil.addToImage(imgs[i], imgs[i + 1])
                    imgs.splice(i + 1, 1);
                }
            }

        }
    } else if (imgs.length !== 4) {
        console.log("ERROR: getMainColorGroupImages: imgs.length=", imgs.length)
    }

    // return imgs;
    for (var i = 0; i < imgs.length; i++) {
        cutInnerNoiseLine(imgs[i]);
        removeColorNoiseIslets(imgs[i], 3)
    }
    return imgs;
}


exports.rotateToMinWidth = rotateToMinWidth;

function rotateToMinWidth(imageData) {
    imageUtil.moveToCenter(imageData);
    var minwidth = imageData.width;
    var mini = 0;

    var newImage = {
        width: imageData.width,
        height: imageData.height,
        data: []
    };
    for (var i = 0; i < imageData.data.length; i += 4) {
        //var nidx = (imageData, idx, hdirection, vdirection);
        if (imageUtil.isPixelWhite(imageData, i)) {
            imageUtil.setPixelColorByIndex(newImage, i, imageData.data[i], imageData.data[i+1], imageData.data[i+2]);
            continue;
        }

        var l = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
        var r = imageUtil.getNeighbourPixelIndex(imageData, i, 1, 0);
        var u = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1)
        var d = imageUtil.getNeighbourPixelIndex(imageData, i, 0, 1)
        if (l>-1 && imageUtil.isPixelWhite(imageData, l) 
            || r>-1 && imageUtil.isPixelWhite(imageData, r) 
            || u>-1 && imageUtil.isPixelWhite(imageData, u)
            || d>-1 && imageUtil.isPixelWhite(imageData, d)) {
            imageUtil.setPixelColorByIndex(newImage, i, imageData.data[i], imageData.data[i+1], imageData.data[i+2]);
            
        } else {
            imageUtil.setPixelColorByIndex(newImage, i, BACKGROUND_COLOR, BACKGROUND_COLOR, BACKGROUND_COLOR)
        }  
    }
    
    for (var i = -30; i <= 30; i += 2) {
        var range = imageUtil.rangeAfterRotate(newImage, i);
        if ((range.right - range.left) < minwidth) {
            minwidth = range.right - range.left;
            mini = i;
        }
    }
    imageUtil.rotate(imageData, mini);
    imageUtil.fillAfterRotate(imageData);
}


function cutInnerNoiseLine(imageData) {

    function closeToWhilte(r, g, b, cmax) {
        var max = Math.max(r, Math.max(g, b));
        if (max >= cmax && Math.abs(r - g) <= 20 && Math.abs(r - b) <= 20 && Math.abs(b - g) <= 20) return true;
        return false;
    }

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            if (imageUtil.isPixelBlackOrWhite(imageData, i)) continue;

            var blackcount = 0;
            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            var downi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, 1);
            if (imageUtil.isPixelBlack(imageData, upi)) {
                blackcount++;
                if (imageUtil.isPixelWhite(imageData, downi) && closeToWhilte(r, g, b, 140)) {
                    imageUtil.setPixelColorByIndex(imageData, i, 255, 255, 255);
                }
            }
            if (imageUtil.isPixelBlack(imageData, downi)) {
                blackcount++;
                if (imageUtil.isPixelWhite(imageData, upi) && closeToWhilte(r, g, b, 140)) {
                    imageUtil.setPixelColorByIndex(imageData, i, 255, 255, 255);
                }
            }

            var lefti = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            var righti = imageUtil.getNeighbourPixelIndex(imageData, i, 1, 0);
            if (imageUtil.isPixelBlack(imageData, lefti)) {
                blackcount++;
                if (imageUtil.isPixelWhite(imageData, righti) && closeToWhilte(r, g, b, 140)) {
                    imageUtil.setPixelColorByIndex(imageData, i, 255, 255, 255);
                }
            }
            if (imageUtil.isPixelBlack(imageData, righti)) {
                blackcount++;
                if (imageUtil.isPixelWhite(imageData, lefti) && closeToWhilte(r, g, b, 140)) {
                    imageUtil.setPixelColorByIndex(imageData, i, 255, 255, 255);
                }
            };
            var leftdowni = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 1);
            var rightupi = imageUtil.getNeighbourPixelIndex(imageData, i, 1, -1);
            var leftlefti = imageUtil.getNeighbourPixelIndex(imageData, i, -2, 0);
            var rightrighti = imageUtil.getNeighbourPixelIndex(imageData, i, 2, 0);
            var upupi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -2);
            var downdowni = imageUtil.getNeighbourPixelIndex(imageData, i, 0, 2);
            if (imageUtil.isPixelBlack(imageData, rightupi)) {
                blackcount++;
                if (imageUtil.isPixelWhite(imageData, leftdowni) && imageUtil.isPixelWhite(imageData, leftlefti) && imageUtil.isPixelWhite(imageData, downdowni) && closeToWhilte(r, g, b, 120)) {
                    imageUtil.setPixelColorByIndex(imageData, i, 255, 255, 255);
                }
            }
            if (imageUtil.isPixelBlack(imageData, leftdowni)) {
                blackcount++;
                if (imageUtil.isPixelWhite(imageData, rightupi) && imageUtil.isPixelWhite(imageData, rightrighti) && imageUtil.isPixelWhite(imageData, upupi) && closeToWhilte(r, g, b, 120)) {
                    imageUtil.setPixelColorByIndex(imageData, i, 255, 255, 255);
                }
            }
            // if (blackcount===2 && closeToWhilte(r, g, b, 120)
            //     || blackcount>=3) {
            //     imageUtil.setPixelColorByIndex(imageData, i, 0, 0, 0)
            // }

        }
    }

    // return;
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (!imageUtil.isPixelBlack(imageData, i)) continue;
            var lefti = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            var righti = imageUtil.getFirstDiffColorIndex(imageData, i, 1, 0);
            if (imageUtil.isPixelWhite(imageData, lefti) && imageUtil.isPixelWhite(imageData, righti)) {
                var leftendi = imageUtil.getFirstDiffColorIndex(imageData, lefti, -1, 0);
                var rightendi = imageUtil.getFirstDiffColorIndex(imageData, righti, 1, 0);
                if (leftendi !== -1 && lefti - leftendi <= 3 * 4 && rightendi === -1 || rightendi !== -1 && rightendi - righti <= 3 * 4 && leftendi === -1) {
                    imageUtil.setColorsInDirection(imageData, i, righti - 4, 1, 0, 255, 255, 255, function(idx) {
                        var _ddiffi = imageUtil.getFirstDiffColorIndex(imageData, idx, 0, 1);
                        var _udiffi = imageUtil.getFirstDiffColorIndex(imageData, idx, 0, -1);
                        return imageUtil.isPixelWhite(imageData, _ddiffi) || imageUtil.isPixelWhite(imageData, _udiffi);
                    });
                }
            }

            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            var downi = imageUtil.getFirstDiffColorIndex(imageData, i, 0, 1);
            if (imageUtil.isPixelWhite(imageData, upi) && imageUtil.isPixelWhite(imageData, downi)) {

                var upendi = imageUtil.getFirstDiffColorIndex(imageData, upi, 0, -1);
                var downendi = imageUtil.getFirstDiffColorIndex(imageData, downi, 0, 1);
                if (upendi !== -1 && upi - upendi <= 3 * 4 * imageData.width && downendi === -1 || downendi !== -1 && downendi - downi <= 3 * 4 * imageData.width && upendi === -1) {
                    imageUtil.setColorsInDirection(imageData, i, downi - 4 * imageData.width, 0, 1, 255, 255, 255, function(idx) {
                        var _ldiffi = imageUtil.getFirstDiffColorIndex(imageData, idx, -1, 0);
                        var _rdiffi = imageUtil.getFirstDiffColorIndex(imageData, idx, 1, 0);
                        return imageUtil.isPixelWhite(imageData, _ldiffi) || imageUtil.isPixelWhite(imageData, _rdiffi);
                    });
                }
            }
        }
    }
    cutNoiseLine45(imageData);
}


function cutNoiseLine45(imageData) {

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (!imageUtil.isPixelBlack(imageData, i)) continue;
            var lefti = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            if (imageUtil.isPixelWhite(imageData, lefti)) {
                var rightdowni = imageUtil.getFirstDiffColorIndex(imageData, i, 1, 1);
                if (rightdowni > -1 && imageUtil.isPixelWhite(imageData, rightdowni)) {
                    imageUtil.setColorsInDirection(imageData, i, rightdowni, 1, 1, 255, 255, 255, function(idx) {
                        var downlefti = imageUtil.getFirstDiffColorIndex(imageData, idx, -1, 1);
                        // var uprighti = imageUtil.getFirstDiffColorIndex(imageData, idx, 1, -1);
                        return imageUtil.isPixelWhite(imageData, downlefti)
                    });
                }

                var rightupi = imageUtil.getFirstDiffColorIndex(imageData, i, 1, -1);
                if (rightupi > -1 && imageUtil.isPixelWhite(imageData, rightupi)) {
                    imageUtil.setColorsInDirection(imageData, i, rightupi, 1, -1, 255, 255, 255, function(idx) {
                        var uplefti = imageUtil.getFirstDiffColorIndex(imageData, idx, -1, -1);
                        return imageUtil.isPixelWhite(imageData, uplefti)
                    });
                }
            }
        }
    }

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (!imageUtil.isPixelBlack(imageData, i)) continue;
            var righti = imageUtil.getNeighbourPixelIndex(imageData, i, 1, 0);
            if (imageUtil.isPixelWhite(imageData, righti)) {
                var leftupdiffi = imageUtil.getFirstDiffColorIndex(imageData, i, -1, -1);
                if (leftupdiffi > -1 && imageUtil.isPixelWhite(imageData, leftupdiffi)) {
                    imageUtil.setColorsInDirection(imageData, i, leftupdiffi, -1, -1, 255, 255, 255, function(idx) {
                        var rightupi = imageUtil.getFirstDiffColorIndex(imageData, idx, 1, -1);
                        return imageUtil.isPixelWhite(imageData, rightupi)
                    });
                }

                var leftdowni = imageUtil.getFirstDiffColorIndex(imageData, i, -1, 1);
                if (leftdowni > -1 && imageUtil.isPixelWhite(imageData, leftdowni)) {
                    imageUtil.setColorsInDirection(imageData, i, leftdowni, -1, 1, 255, 255, 255, function(idx) {
                        var rightdowni = imageUtil.getFirstDiffColorIndex(imageData, idx, 1, 1);
                        return imageUtil.isPixelWhite(imageData, rightdowni);
                    });
                }
            }
        }
    }

}

function cutNoiseLine(imageData) {

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (!imageUtil.isPixelBlack(imageData, i)) continue;
            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            if (imageUtil.isPixelWhite(imageData, upi)) {
                var fdiffidx = imageUtil.getFirstDiffColorIndex(imageData, i, 0, 1);
                if (fdiffidx > -1 && imageUtil.isPixelWhite(imageData, fdiffidx)) {
                    imageUtil.setColorsInDirection(imageData, i, fdiffidx, 0, 1, 255, 255, 255, function(idx) {
                        var len = (fdiffidx - i) / (imageData.width * 4);
                        var righti = imageUtil.getFirstDiffColorIndex(imageData, idx, 1, 0);
                        if (len >= 5 && !imageUtil.isPixelWhite(imageData, righti) && (righti - i) <= 8) return false;
                        var lefti = imageUtil.getFirstDiffColorIndex(imageData, idx, -1, 0);
                        if (len >= 5 && !imageUtil.isPixelWhite(imageData, lefti) && (i - lefti) <= 8) return false;
                        return (imageUtil.isPixelWhite(imageData, righti) || imageUtil.isPixelWhite(imageData, lefti))
                    });
                }
            }
        }
    }

    cutNoiseLine45(imageData);

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (!imageUtil.isPixelBlack(imageData, i)) continue;
            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            if (imageUtil.isPixelWhite(imageData, upi)) {
                var downi = imageUtil.getFirstDiffColorIndex(imageData, i, 0, 1);
                if (downi > -1 && imageUtil.isPixelWhite(imageData, downi)) {
                    imageUtil.setColorsInDirection(imageData, i, downi, 0, 1, 255, 255, 255, function(idx) {
                        var righti = imageUtil.getFirstDiffColorIndex(imageData, idx, 1, 0);
                        var len = (downi - i) / (imageData.width * 4);
                        if (len >= 5 && !imageUtil.isPixelWhite(imageData, righti) && (righti - i) <= 8) return false;
                        var lefti = imageUtil.getFirstDiffColorIndex(imageData, idx, -1, 0);
                        if (len >= 5 && !imageUtil.isPixelWhite(imageData, lefti) && (i - lefti) <= 8) return false;
                        return true;
                    });
                }
            }
        }
    }

}
exports.cutNoiseLine = cutNoiseLine;

exports.degrade = degrade;

function degrade(imageData) {
    var pixelCountMap = {};
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;

            imageData.data[i] = imageUtil.degradeColor(imageData.data[i], DEGRADE_UNIT);
            imageData.data[i + 1] = imageUtil.degradeColor(imageData.data[i + 1], DEGRADE_UNIT);
            imageData.data[i + 2] = imageUtil.degradeColor(imageData.data[i + 2], DEGRADE_UNIT);
            imageData.data[i + 3] = 255;
            // var key = r+"_"+g+"_"+b;
            // if (undefined === pixelCountMap[key]) pixelCountMap[key] = 0;
            // pixelCountMap[key] += 1;
        }
    }
    var pixels = [];
    for (var att in pixelCountMap) {
        if (pixelCountMap[att] > MINOR_PIXEL_NOISE_LIMIT) {
            pixels.push(att);
        }
    }
}

exports.detectNoiseLine = detectNoiseLine;

function detectNoiseLine(imageData, x, y, nbrsMap) {
    var p = x * 4 + y * 4 * imageData.width;
    if (undefined === nbrsMap[p] && isNoiseLine(imageData, p)) {
        nbrsMap[p] = p;
    } else {
        return;
    }
    var up = imageUtil.getNeighbourPixelIndex(imageData, p, 0, -1);
    var down = imageUtil.getNeighbourPixelIndex(imageData, p, 0, 1);

    var left = imageUtil.getNeighbourPixelIndex(imageData, p, -1, 0);
    var right = imageUtil.getNeighbourPixelIndex(imageData, p, 1, 0);

    if ((up < 0 || down < 0) && (left < 0 || right < 0)) return;

    if (up >= 0 && undefined === nbrsMap[up] && isNoiseLine(imageData, up)) {
        detectNoiseLine(imageData, x, y - 1, nbrsMap);
    }

    if (down >= 0 && undefined === nbrsMap[down] && isNoiseLine(imageData, down)) {
        detectNoiseLine(imageData, x, y + 1, nbrsMap);
    }

    if (left >= 0 && undefined === nbrsMap[left] && isNoiseLine(imageData, left)) {
        detectNoiseLine(imageData, x - 1, y, nbrsMap);
    }

    if (right >= 0 && undefined === nbrsMap[right] && isNoiseLine(imageData, right)) {
        detectNoiseLine(imageData, x + 1, y, nbrsMap);
    }

}


exports.removeBackground = removeBackground;

function removeBackground(imageData) {
    var pixelCountMap = {};
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;

            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            var limit = 180;
            if (r >= limit && g >= limit || r >= limit && b >= limit || g >= limit && b >= limit) {
                imageData.data[i] = 255;
                imageData.data[i + 1] = 255;
                imageData.data[i + 2] = 255;
            } else if (
                Math.abs(r - g) <= 40 && Math.abs(r - b) <= 40 && Math.abs(g - b) <= 40 && Math.max(r, Math.max(g, b)) <= 120 || Math.abs(r - g) <= 20 && Math.abs(r - b) <= 20 && Math.abs(g - b) <= 20
                // Math.abs(r - g) <= 40 && Math.abs(r - b) <= 40 && Math.abs(g - b) <= 40 && Math.max(r, Math.max(g, b)) <= 100 
                // || Math.abs(r - g) <= 20 && Math.abs(r - b) <= 20 && Math.abs(g - b) <= 20
            ) {
                // imageData.data[i] = 0;
                // imageData.data[i + 1] = 0;
                // imageData.data[i + 2] = 0;

            }

            // var key = r+"_"+g+"_"+b;
            // if (undefined === pixelCountMap[key]) pixelCountMap[key] = 0;
            // pixelCountMap[key] += 1;
        }
    }

}

function removeNoiseLine(imageData) {
    var pixelCountMap = {};
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (pixelCountMap[i] !== undefined) continue;
            var pixelMap = {};
            if (isNoiseLine(imageData, i, 110)) {
                detectNoiseLine(imageData, x, y, pixelMap);
                for (var att in pixelMap) {
                    pixelCountMap[att] = pixelMap[att];
                }
            }
        }
    }
    var nlimg = imageUtil.getSubImage(imageData, pixelCountMap);
    removeColorNoiseIslets(nlimg, 3);

    for (var x = 0; x < nlimg.width; x++) {
        for (var y = 0; y < nlimg.height; y++) {
            var i = x * 4 + y * 4 * nlimg.width;
            if (imageUtil.isPixelWhite(nlimg, i)) continue;
            var downi = imageUtil.getNeighbourPixelIndex(nlimg, i, 0, 1);
            var downlefti = imageUtil.getNeighbourPixelIndex(nlimg, i, -1, 1);
            var downrighti = imageUtil.getNeighbourPixelIndex(nlimg, i, 1, 1);
            if (imageUtil.isPixelWhite(nlimg, downi) && !imageUtil.isPixelWhite(nlimg, downlefti) && !imageUtil.isPixelWhite(nlimg, downrighti)) {
                imageUtil.setPixelColorByIndex(nlimg, downi, 0, 0, 0);
                continue;
            }

            var upi = imageUtil.getNeighbourPixelIndex(nlimg, i, 0, -1);
            var uplefti = imageUtil.getNeighbourPixelIndex(nlimg, i, -1, -1);
            var uprighti = imageUtil.getNeighbourPixelIndex(nlimg, i, 1, -1);
            if (imageUtil.isPixelWhite(nlimg, upi) && !imageUtil.isPixelWhite(nlimg, uplefti) && !imageUtil.isPixelWhite(nlimg, uprighti)) {
                imageUtil.setPixelColorByIndex(nlimg, upi, 0, 0, 0);
                continue;
            }

            var righti = imageUtil.getNeighbourPixelIndex(nlimg, i, 1, 0);
            if (imageUtil.isPixelWhite(nlimg, righti) && !imageUtil.isPixelWhite(nlimg, uprighti) && !imageUtil.isPixelWhite(nlimg, downrighti)) {
                imageUtil.setPixelColorByIndex(nlimg, righti, 0, 0, 0);
                continue;
            }

            var lefti = imageUtil.getNeighbourPixelIndex(nlimg, i, -1, 0);
            if (imageUtil.isPixelWhite(nlimg, lefti) && !imageUtil.isPixelWhite(nlimg, uplefti) && !imageUtil.isPixelWhite(nlimg, downlefti)) {
                imageUtil.setPixelColorByIndex(nlimg, lefti, 0, 0, 0);
                continue;
            }

            var rri = imageUtil.getNeighbourPixelIndex(nlimg, i, 2, 0);
            var drri = imageUtil.getNeighbourPixelIndex(nlimg, i, 2, 1);
            if (imageUtil.isPixelWhite(nlimg, righti) && !imageUtil.isPixelWhite(nlimg, upi) && imageUtil.isPixelWhite(nlimg, uprighti) && !imageUtil.isPixelWhite(nlimg, downrighti) && imageUtil.isPixelWhite(nlimg, rri) && !imageUtil.isPixelWhite(nlimg, drri)) {
                imageUtil.setPixelColorByIndex(nlimg, righti, 0, 0, 0);
                continue;
            }

            var lli = imageUtil.getNeighbourPixelIndex(nlimg, i, -2, 0);
            var ulli = imageUtil.getNeighbourPixelIndex(nlimg, i, -2, -1);
            if (imageUtil.isPixelWhite(nlimg, lefti) && !imageUtil.isPixelWhite(nlimg, downi) && imageUtil.isPixelWhite(nlimg, downlefti) && !imageUtil.isPixelWhite(nlimg, uplefti) && imageUtil.isPixelWhite(nlimg, lli) && !imageUtil.isPixelWhite(nlimg, ulli)) {
                imageUtil.setPixelColorByIndex(nlimg, lefti, 0, 0, 0);
                continue;
            }

            var urri = imageUtil.getNeighbourPixelIndex(nlimg, i, 2, -1);
            if (imageUtil.isPixelWhite(nlimg, righti) && !imageUtil.isPixelWhite(nlimg, downi) && imageUtil.isPixelWhite(nlimg, downrighti) && !imageUtil.isPixelWhite(nlimg, uprighti) && imageUtil.isPixelWhite(nlimg, rri) && !imageUtil.isPixelWhite(nlimg, urri)) {
                imageUtil.setPixelColorByIndex(nlimg, righti, 0, 0, 0);
                continue;
            }

            var dlli = imageUtil.getNeighbourPixelIndex(nlimg, i, -2, 1);
            if (imageUtil.isPixelWhite(nlimg, lefti) && !imageUtil.isPixelWhite(nlimg, upi) && imageUtil.isPixelWhite(nlimg, uprighti) && !imageUtil.isPixelWhite(nlimg, downlefti) && imageUtil.isPixelWhite(nlimg, lli) && !imageUtil.isPixelWhite(nlimg, dlli)) {
                imageUtil.setPixelColorByIndex(nlimg, lefti, 0, 0, 0);
                continue;
            }


        }
    }

    imageUtil.removeSubImage(imageData, nlimg, 0);

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (!imageUtil.isPixelBlack(imageData, i)) continue;
            var di = imageUtil.getNeighbourPixelIndex(nlimg, i, 0, 1);
            var ddi = imageUtil.getNeighbourPixelIndex(nlimg, i, 0, 2);
            if (!imageUtil.isPixelBlack(imageData, di) && !imageUtil.isPixelWhite(imageData, di) && imageUtil.isPixelWhite(imageData, ddi)) {
                var diffidx = imageUtil.getFirstDiffColorIndex(imageData, i, 0, -1);
                var diffidxup = imageUtil.getNeighbourPixelIndex(imageData, diffidx, 0, -1);
                if (diffidx < 0 || imageUtil.isPixelWhite(imageData, diffidx) || diffidxup < 0 || imageUtil.isPixelWhite(imageData, diffidxup)) {
                    imageUtil.setPixelColorByIndex(imageData, di, 0, 0, 0);
                    if (!imageUtil.isPixelWhite(imageData, diffidx) && !imageUtil.isPixelBlack(imageData, diffidx)) {
                        imageUtil.setPixelColorByIndex(imageData, diffidx, 0, 0, 0);
                    }
                }

                var ldi = imageUtil.getNeighbourPixelIndex(imageData, di, -1, 0);
                var rdi = imageUtil.getNeighbourPixelIndex(imageData, di, 1, 0);
                var ldrd = {};
                ldrd[ldi] = ldi;
                ldrd[rdi] = rdi;
                ldrd[di] = di;
                if (imageUtil.isPixelBlackOrWhite(imageData, ldi) && imageUtil.isPixelBlackOrWhite(imageData, rdi)) {
                    imageUtil.setPixelColorByIndex(imageData, di, 0, 0, 0);
                } else if (imageUtil.isPixelBlackOrWhite(imageData, ldi) && imageUtil.inBlackWhilte(imageData, ldrd)) {
                    imageUtil.setPixelColorByIndex(imageData, di, 0, 0, 0);
                    imageUtil.setPixelColorByIndex(imageData, rdi, 0, 0, 0);
                } else if (imageUtil.isPixelBlackOrWhite(imageData, rdi) && imageUtil.inBlackWhilte(imageData, ldrd)) {
                    imageUtil.setPixelColorByIndex(imageData, di, 0, 0, 0);
                    imageUtil.setPixelColorByIndex(imageData, ldi, 0, 0, 0);
                }

            }

            var ui = imageUtil.getNeighbourPixelIndex(nlimg, i, 0, -1);
            var uui = imageUtil.getNeighbourPixelIndex(nlimg, i, 0, -2);
            if (!imageUtil.isPixelBlack(imageData, ui) && !imageUtil.isPixelWhite(imageData, ui) && imageUtil.isPixelWhite(imageData, uui)) {
                var diffidx = imageUtil.getFirstDiffColorIndex(imageData, i, 0, 1);
                if (diffidx < 0 || imageUtil.isPixelWhite(imageData, diffidx)) {
                    imageUtil.setPixelColorByIndex(imageData, ui, 0, 0, 0);
                }

                var lui = imageUtil.getNeighbourPixelIndex(imageData, ui, -1, 0);
                var rui = imageUtil.getNeighbourPixelIndex(imageData, ui, 1, 0);
                var ldrd = {};
                ldrd[ldi] = lui;
                ldrd[rdi] = rui;
                ldrd[di] = ui;
                if (imageUtil.isPixelBlackOrWhite(imageData, lui) && imageUtil.isPixelBlackOrWhite(imageData, rui)) {
                    imageUtil.setPixelColorByIndex(imageData, ui, 0, 0, 0);
                } else if (imageUtil.isPixelBlackOrWhite(imageData, lui) && imageUtil.inBlackWhilte(imageData, ldrd)) {
                    imageUtil.setPixelColorByIndex(imageData, ui, 0, 0, 0);
                    imageUtil.setPixelColorByIndex(imageData, rui, 0, 0, 0);
                } else if (imageUtil.isPixelBlackOrWhite(imageData, rui) && imageUtil.inBlackWhilte(imageData, ldrd)) {
                    imageUtil.setPixelColorByIndex(imageData, ui, 0, 0, 0);
                    imageUtil.setPixelColorByIndex(imageData, lui, 0, 0, 0);
                }

            }

            var li = imageUtil.getNeighbourPixelIndex(nlimg, i, -1, 0);
            var lli = imageUtil.getNeighbourPixelIndex(nlimg, i, -2, 0);
            if (!imageUtil.isPixelBlack(imageData, li) && !imageUtil.isPixelWhite(imageData, li) && imageUtil.isPixelWhite(imageData, lli)) {
                var diffidx = imageUtil.getFirstDiffColorIndex(imageData, i, 1, 0);
                var diffidxright = imageUtil.getNeighbourPixelIndex(imageData, diffidx, 1, 0);
                if (diffidx < 0 || imageUtil.isPixelWhite(imageData, diffidx) || diffidxright < 0 || imageUtil.isPixelWhite(imageData, diffidxright)) {
                    imageUtil.setPixelColorByIndex(imageData, li, 0, 0, 0);
                    if (!imageUtil.isPixelWhite(imageData, diffidx) && !imageUtil.isPixelBlack(imageData, diffidx)) {
                        imageUtil.setPixelColorByIndex(imageData, diffidx, 0, 0, 0);
                    }
                }
            }

            var ri = imageUtil.getNeighbourPixelIndex(nlimg, i, 1, 0);
            var rri = imageUtil.getNeighbourPixelIndex(nlimg, i, 2, 0);
            if (!imageUtil.isPixelBlack(imageData, ri) && !imageUtil.isPixelWhite(imageData, ri) && imageUtil.isPixelWhite(imageData, rri)) {
                var diffidx = imageUtil.getFirstDiffColorIndex(imageData, i, -1, 0);
                if (diffidx < 0 || imageUtil.isPixelWhite(imageData, diffidx)) {
                    imageUtil.setPixelColorByIndex(imageData, ri, 0, 0, 0);
                }
            }



        }
    }


    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (!isNoiseLine(imageData, i, 255)) continue;
            var lefti = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            var righti = imageUtil.getNeighbourPixelIndex(imageData, i, 1, 0);
            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            var downi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, 1);
            var rightdowni = imageUtil.getNeighbourPixelIndex(imageData, i, 1, 1);
            var leftupi = imageUtil.getNeighbourPixelIndex(imageData, i, -1, -1);
            var rightupi = imageUtil.getNeighbourPixelIndex(imageData, i, 1, -1);
            var leftdowni = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 1);
            if (imageUtil.isPixelBlack(imageData, rightdowni) && imageUtil.isPixelWhite(imageData, upi) && imageUtil.isPixelWhite(imageData, lefti) && (imageUtil.isPixelBlack(imageData, downi) || isNoiseLine(imageData, downi, 255)) && (imageUtil.isPixelBlack(imageData, righti) || isNoiseLine(imageData, righti, 255))) {
                imageUtil.setPixelColorByIndex(imageData, i, 0, 0, 0);
            } else if (imageUtil.isPixelBlack(imageData, lefti) && imageUtil.isPixelBlack(imageData, righti) && imageUtil.isPixelBlack(imageData, upi) && imageUtil.isPixelBlack(imageData, downi)) {
                imageUtil.setPixelColorByIndex(imageData, i, 0, 0, 0);
            } else if (imageUtil.isPixelBlack(imageData, leftupi) && imageUtil.isPixelWhite(imageData, downi) && imageUtil.isPixelWhite(imageData, righti) && (imageUtil.isPixelBlack(imageData, upi) || isNoiseLine(imageData, upi, 255)) && (imageUtil.isPixelBlack(imageData, lefti) || isNoiseLine(imageData, lefti, 255))) {
                imageUtil.setPixelColorByIndex(imageData, i, 0, 0, 0);
            } else if (imageUtil.isPixelBlack(imageData, leftupi) && imageUtil.isPixelWhite(imageData, upi) && imageUtil.isPixelWhite(imageData, lefti) && (imageUtil.isPixelWhite(imageData, righti) || isNoiseLine(imageData, righti, 255)) && (imageUtil.isPixelWhite(imageData, downi) || isNoiseLine(imageData, downi, 255))) {
                imageUtil.setPixelColorByIndex(imageData, i, 0, 0, 0);
            }



        }
    }

    return nlimg;
}

// function splitCharactors(imageData) {
//     var colorPixels = {};
//     var colorKeys = [];
//     // return [imageData]
//     var avex = imageUtil.getPixelAveX(imageData);
//     var avey = imageUtil.getPixelAveY(imageData);
//     var blackPIxels = {};
//     for (var i = 0; i < imageData.data.length; i += 4) {
//         var r = imageData.data[i];
//         var g = imageData.data[i + 1];
//         var b = imageData.data[i + 2];
//         if (r === g && r === b && g === b && r === 0) {
//             blackPIxels[i] = i;
//             continue;
//         } else if (r === g && r === b && r === BACKGROUND_COLOR) continue;

//         var key = r + "_" + g + "_" + b;
//         if (!colorPixels[key]) {
//             colorKeys.push(key);
//             colorPixels[key] = [];
//         }
//         colorPixels[key].push(i);
//     }

//     colorKeys.sort(function(k1, k2) {
//         if (colorPixels[k1].length > colorPixels[k2].length) return -1;
//         else if (colorPixels[k1].length < colorPixels[k2].length) return 1;
//         else return 0;
//     });

//     var getAveX = function(pixels) {
//         var tx = 0;
//         for (var _p = 0; _p < pixels.length; _p++) {
//             tx += (pixels[_p] % (imageData.width * 4)) / 4;
//         }

//         return tx / pixels.length;
//     }
//     var getAveY = function(pixels) {
//         var ty = 0;
//         for (var _p = 0; _p < pixels.length; _p++) {
//             ty += Math.floor(pixels[_p] / (imageData.width * 4));
//         }
//         return ty / pixels.length;
//     }

//     var mainkey0_idx;
//     var image0pixels = []; //colorPixels[colorKeys[mainkey0_idx]];
//     var rgb_main_str_0;
//     var avex0;
//     var avey0;

//     var mainkey1_idx;
//     var rgb_main_str_1;
//     var image1pixels = [];
//     var avex1;
//     var avey1;
//     // console.log("ave:", avex, avey);
//     for (var i = 0; i < colorKeys.length; i++) {
//         var ckey = colorKeys[i];
//         var avexi = getAveX(colorPixels[ckey]);
//         var aveyi = getAveY(colorPixels[ckey]);
//         if (true || Math.abs(avex - avexi) > 10 || Math.abs(avey - aveyi) > 6) {
//             if (mainkey0_idx === undefined) {
//                 mainkey0_idx = i;
//                 avex0 = getAveX(colorPixels[colorKeys[i]]);
//                 avey0 = getAveY(colorPixels[colorKeys[i]]);
//                 // console.log(i, "avex0", avex0, "avey0", avey0, ckey, colorPixels[ckey].length);
//                 imageUtil.arrayConcat(image0pixels, colorPixels[ckey]);
//             } else if (mainkey0_idx !== undefined && Math.abs(avex0 - avexi) < 25 && Math.abs(avey0 - aveyi) < 13) {
//                 //console.log("add to group0", avex0, avexi, avey0, aveyi, colorKeys[mainkey0_idx], ckey, colorPixels[ckey].length)
//                 imageUtil.arrayConcat(image0pixels, colorPixels[ckey]);
//             } else if (mainkey1_idx === undefined) {
//                 mainkey1_idx = i;
//                 avex1 = getAveX(colorPixels[colorKeys[i]]);
//                 avey1 = getAveY(colorPixels[colorKeys[i]]);
//                 // console.log(i, "avex1", avex1, "avey1", avey1, ckey, colorPixels[ckey].length);
//                 imageUtil.arrayConcat(image1pixels, colorPixels[ckey]);
//             } else if (mainkey1_idx !== undefined && Math.abs(avex1 - avexi) < 25 && Math.abs(avey1 - aveyi) < 13) {
//                 imageUtil.arrayConcat(image1pixels, colorPixels[ckey]);
//                 // console.log("add to group1", colorKeys[mainkey1_idx], ckey, colorPixels[ckey].length)
//             } else {
//                 var dist0 = distanceIn3DByColorKey(ckey, colorKeys[mainkey0_idx])
//                 var dist1 = distanceIn3DByColorKey(ckey, colorKeys[mainkey1_idx])
//                 if (dist0 < dist1 * 0.8 && Math.abs(avex0 - avexi) < Math.abs(avex1 - avexi)) {
//                     imageUtil.arrayConcat(image0pixels, colorPixels[ckey])
//                 } else if (dist1 < dist0 * 0.8 && Math.abs(avex1 - avexi) < Math.abs(avex0 - avexi)) {
//                     imageUtil.arrayConcat(image1pixels, colorPixels[ckey])
//                 } else {
//                     imageUtil.arrayConcat(image0pixels, colorPixels[ckey])
//                     imageUtil.arrayConcat(image1pixels, colorPixels[ckey])
//                         // console.log("add to both images",i, ckey, dist0, dist1, colorPixels[ckey].length);
//                 }


//             }


//         } else {
//             console.log("drop", i, "avexi", avexi, "aveyi", aveyi, ckey, colorPixels[ckey].length);
//         }
//     }
//     if (image0pixels.length < MINIMUM_CHAR_PIXEL || image1pixels.length < MINIMUM_CHAR_PIXEL) return [imageData];

//     var img0 = imageUtil.getSubImage(imageData, image0pixels);
//     var img1 = imageUtil.getSubImage(imageData, image1pixels);

//     function mergePixels(_img0, _img1) {
//         imageUtil.addToImage(_img0, imageData, blackPIxels);
//         cutNoiseLine(_img0);
//         var removed0 = removeFarIslets(_img0, 5, 10);
//         imageUtil.addToImage(_img1, imageData, removed0);
//     }

//     mergePixels(img0, img1);
//     mergePixels(img1, img0);

//     function mergeIslets(_img0, _img1) {
//         var islets = imageUtil.getIslets(_img0, 200);
//         var img1map = imageUtil.pixelMap(_img1);
//         for (var i = 0; i < islets.length; i++) {
//             var islet = islets[i];
//             var count = 0;
//             for (var att in islet) {
//                 count++;
//             }

//             imageUtil.addToImage(_img1, _img0, islet);
//             var dist = imageUtil.getIsletsMinDistance(_img1, islet, img1map);
//             if (dist === 0) {
//                 imageUtil.removePixelColor(_img0, islet);
//             } else {
//                 console.log("mergeIslets:------------------ distance is not 0");
//             }
//         }
//     }
//     // return [img1]
//     mergeIslets(img0, img1);
//     mergeIslets(img1, img0);

//     var avx0 = imageUtil.getPixelAveX(img0);
//     var avx1 = imageUtil.getPixelAveX(img1);
//     return avx0 < avx1 ? [img0, img1] : [img1, img0];
// }


function splitCharactors(imageData) {
    var colorPixels = {};
    var colorKeys = [];
    // return [imageData]
    var avex = imageUtil.getPixelAveX(imageData);
    var avey = imageUtil.getPixelAveY(imageData);
    var blackPIxels = {};
    for (var i = 0; i < imageData.data.length; i += 4) {
        var r = imageData.data[i];
        var g = imageData.data[i + 1];
        var b = imageData.data[i + 2];
        if (r === g && r === b && g === b && r === 0) {
            blackPIxels[i] = i;
            continue;
        } else if (r === g && r === b && r === BACKGROUND_COLOR) continue;

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

    var getAveX = function(pixels) {
        var tx = 0;
        for (var _p = 0; _p < pixels.length; _p++) {
            tx += (pixels[_p] % (imageData.width * 4)) / 4;
        }

        return tx / pixels.length;
    }
    var getAveY = function(pixels) {
        var ty = 0;
        for (var _p = 0; _p < pixels.length; _p++) {
            ty += Math.floor(pixels[_p] / (imageData.width * 4));
        }
        return ty / pixels.length;
    }

    var mainkey0_idx;
    var image0pixels = []; //colorPixels[colorKeys[mainkey0_idx]];
    var rgb_main_str_0;
    var avex0;
    var avey0;

    var mainkey1_idx;
    var rgb_main_str_1;
    var image1pixels = [];
    var avex1;
    var avey1;
    // console.log("ave:", avex, avey);
    for (var i = 0; i < colorKeys.length; i++) {
        var ckey = colorKeys[i];
        var avexi = getAveX(colorPixels[ckey]);
        var aveyi = getAveY(colorPixels[ckey]);
        if (mainkey0_idx === undefined) {
            mainkey0_idx = i;
            avex0 = getAveX(colorPixels[colorKeys[i]]);
            avey0 = getAveY(colorPixels[colorKeys[i]]);
            // console.log(i, "avex0", avex0, "avey0", avey0, ckey, colorPixels[ckey].length);
            imageUtil.arrayConcat(image0pixels, colorPixels[ckey]);
        } else if (mainkey0_idx !== undefined && Math.abs(avex0 - avexi) < 25 && Math.abs(avey0 - aveyi) < 13) {
            //console.log("add to group0", avex0, avexi, avey0, aveyi, colorKeys[mainkey0_idx], ckey, colorPixels[ckey].length)
            imageUtil.arrayConcat(image0pixels, colorPixels[ckey]);
        } else if (mainkey1_idx === undefined) {
            mainkey1_idx = i;
            avex1 = getAveX(colorPixels[colorKeys[i]]);
            avey1 = getAveY(colorPixels[colorKeys[i]]);
            // console.log(i, "avex1", avex1, "avey1", avey1, ckey, colorPixels[ckey].length);
            imageUtil.arrayConcat(image1pixels, colorPixels[ckey]);
        } else if (mainkey1_idx !== undefined && Math.abs(avex1 - avexi) < 25 && Math.abs(avey1 - aveyi) < 13) {
            imageUtil.arrayConcat(image1pixels, colorPixels[ckey]);
            // console.log("add to group1", colorKeys[mainkey1_idx], ckey, colorPixels[ckey].length)
        } else {
            var dist0 = distanceIn3DByColorKey(ckey, colorKeys[mainkey0_idx])
            var dist1 = distanceIn3DByColorKey(ckey, colorKeys[mainkey1_idx])
            if (dist0 < dist1 * 0.8 && Math.abs(avex0 - avexi) < Math.abs(avex1 - avexi)) {
                imageUtil.arrayConcat(image0pixels, colorPixels[ckey])
            } else if (dist1 < dist0 * 0.8 && Math.abs(avex1 - avexi) < Math.abs(avex0 - avexi)) {
                imageUtil.arrayConcat(image1pixels, colorPixels[ckey])
            } else {
                imageUtil.arrayConcat(image0pixels, colorPixels[ckey])
                imageUtil.arrayConcat(image1pixels, colorPixels[ckey])
                    // console.log("add to both images",i, ckey, dist0, dist1, colorPixels[ckey].length);
            }


        }


    }
    if (image0pixels.length < MINIMUM_CHAR_PIXEL || image1pixels.length < MINIMUM_CHAR_PIXEL) return [imageData];

    var img0 = imageUtil.getSubImage(imageData, image0pixels);
    var img1 = imageUtil.getSubImage(imageData, image1pixels);

    function mergePixels(_img0, _img1) {
        imageUtil.addToImage(_img0, imageData, blackPIxels);
        cutNoiseLine(_img0);
        var removed0 = removeFarIslets(_img0, 5, 10);
        imageUtil.addToImage(_img1, imageData, removed0);
    }

    mergePixels(img0, img1);
    mergePixels(img1, img0);

    function mergeIslets(_img0, _img1) {
        var islets = imageUtil.getIslets(_img0, 200);
        var img1map = imageUtil.pixelMap(_img1);
        for (var i = 0; i < islets.length; i++) {
            var islet = islets[i];
            var count = 0;
            for (var att in islet) {
                count++;
            }

            imageUtil.addToImage(_img1, _img0, islet);
            var dist = imageUtil.getIsletsMinDistance(_img1, islet, img1map);
            if (dist === 0) {
                imageUtil.removePixelColor(_img0, islet);
            } else {
                console.log("mergeIslets:------------------ distance is not 0");
                throw "Distance is not 0!";
            }
        }
    }
    // return [img1]
    mergeIslets(img0, img1);
    mergeIslets(img1, img0);

    var avx0 = imageUtil.getPixelAveX(img0);
    var avx1 = imageUtil.getPixelAveX(img1);
    return avx0 < avx1 ? [img0, img1] : [img1, img0];
}

function getColorGroups(imageData, groupNum, groupMin, rgbMinDiff) {
    var colorGroups = {};
    var colorKeys = [];
    for (var i = 0; i < imageData.data.length; i += 4) {
        var r = imageData.data[i];
        var g = imageData.data[i + 1];
        var b = imageData.data[i + 2];

        if (r === g && r === b && r === BACKGROUND_COLOR) continue;
        else if (Math.abs(r - g) <= rgbMinDiff && Math.abs(r - b) <= rgbMinDiff && Math.abs(b - g) <= rgbMinDiff && r <= 110 && g <= 110 && b <= 110 || r <= 0 && g <= 0 && b <= 20) continue;
        var key = r + "_" + g + "_" + b;
        if (!colorGroups[key]) {
            colorKeys.push(key);
            colorGroups[key] = 0;
        }
        colorGroups[key]++;
    }

    colorKeys.sort(function(k1, k2) {
        if (colorGroups[k1] > colorGroups[k2]) return -1;
        else if (colorGroups[k1] < colorGroups[k2]) return 1;
        else return 0;
    })

    var distanceIdx = 1;
    var mainKeys;
    do {
        mainKeys = [colorKeys[0]];
        for (var i = 1; i < colorKeys.length; i++) {
            if (colorGroups[colorKeys[i]] < groupMin) break;
            var rgbarr = colorKeys[i].split("_");
            rgbarr = [Number(rgbarr[0]), Number(rgbarr[1]), Number(rgbarr[2])];

            var diffgroup = true;
            for (var j = 0; j < mainKeys.length; j++) {
                var rgbarrj = mainKeys[j].split("_");
                rgbarrj = [Number(rgbarrj[0]), Number(rgbarrj[1]), Number(rgbarrj[2])];
                if (distanceIn3D(rgbarrj, rgbarr) < distanceIdx * GROUP_COLOR_MIN_DISTANCE) {
                    diffgroup = false;
                    break;
                }
            }

            if (diffgroup) {
                mainKeys.push(colorKeys[i]);
                // console.log("add main group color", diffgroup, colorKeys[i], colorGroups[colorKeys[i]]);
            }
        }
        distanceIdx += 0.3;

        // console.log("length：", distanceIdx, 　mainKeys.length, mainKeys.toString(), colorGroups[mainKeys[0]])
    } while (mainKeys.length > groupNum);

    // for (var i = 0; i < mainKeys.length; i++) {
    //     console.log("mainKeys:", i, mainKeys[i], colorGroups[mainKeys[i]]);
    // }

    var mainColorGroups = [];
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];

            if (r === g && r === b && r === BACKGROUND_COLOR) continue;
            else if (Math.abs(r - g) < rgbMinDiff && Math.abs(r - b) < rgbMinDiff && Math.abs(b - g) < rgbMinDiff) continue;

            for (var m = 0; m < mainKeys.length; m++) {
                var rgbarr = mainKeys[m].split("_");
                rgbarr = [Number(rgbarr[0]), Number(rgbarr[1]), Number(rgbarr[2])];
                if (distanceIn3D(rgbarr, [r, g, b]) < distanceIdx * GROUP_COLOR_MIN_DISTANCE) {
                    if (mainColorGroups[m] === undefined) mainColorGroups[m] = {};
                    mainColorGroups[m][i] = i;
                    break;
                }
            }
        }
    }

    return mainColorGroups;
}

function hRecoverColorsNearby(img, originImage, leftimg, rightimg) {
    var recoveredMap = {};
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var i = x * 4 + y * 4 * img.width;
            if (recoveredMap[i] !== undefined) continue;
            var r = img.data[i];
            var g = img.data[i + 1];
            var b = img.data[i + 2];
            if (r === BACKGROUND_COLOR && g === BACKGROUND_COLOR && b === BACKGROUND_COLOR || r === 0 && g === 0 && b === 0) continue;

            var _setRecoverColor = function(_img, _orig, _rps) {
                if (_rps.length > 0) {
                    if (_rps.length > 15) _rps = _rps.slice(0, 14);
                    var blackEndStart = -1;
                    for (var _b = _rps.length - 1; _b >= 0; _b--) {
                        if (imageUtil.isPixelBlack(_orig, _rps[_b])) {
                            blackEndStart = _b;
                        } else {
                            break;
                        }
                    }
                    var blackStart = -1;
                    var len = _rps.length;
                    for (var j = 0; j < len; j++) {
                        var ri = _rps[j];
                        if (blackStart < 0 && imageUtil.isPixelBlack(_orig, ri)) {
                            blackStart = j;
                        }

                        var _x = (ri % (_orig.width * 4)) / 4;
                        var _y = Math.floor(ri / (_orig.width * 4));


                        if (blackStart != -1 && blackStart === blackEndStart && j >= blackEndStart) break;

                        _img.data[ri] = _orig.data[ri];
                        _img.data[ri + 1] = _orig.data[ri + 1];
                        _img.data[ri + 2] = _orig.data[ri + 2];

                        if (_x >= 181 && _y == 58) {
                            console.log(_x, _y, blackStart, blackEndStart, _rps.length, j, _orig.data[ri]);
                        }

                        if (blackEndStart != -1 && blackEndStart <= j && imageUtil.isPixelBlack(_orig, ri)
                            // && _x>0 && _x<_orig.width-1
                            && imageUtil.isPixelWhite(_img, ri - 4 * _orig.width) && imageUtil.isPixelWhite(_img, ri + 4 * _orig.width)) {
                            break;
                        }

                    }
                }
            }

            var lefti = imageUtil.getNeighbourPixelIndex(img, i, -1, 0);
            if (imageUtil.isPixelWhite(img, lefti)) {
                var rpixels = checkRecoverColorInDirection(i, -1, 0, img, originImage, leftimg, rightimg);
                if (y === 43) console.log("rpixels:", x, y, rpixels.length);
                _setRecoverColor(img, originImage, rpixels);
            }

            var righti = imageUtil.getNeighbourPixelIndex(img, i, 1, 0);
            if (imageUtil.isPixelWhite(img, righti)) {
                var rpixels = checkRecoverColorInDirection(i, 1, 0, img, originImage, leftimg, rightimg);
                _setRecoverColor(img, originImage, rpixels);
            }

        }
    }

}

function vRecoverColorsNearby(img, originImage, leftimg, rightimg) {
    var recoveredMap = {};
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var i = x * 4 + y * 4 * img.width;
            if (recoveredMap[i] !== undefined) continue;
            var r = img.data[i];
            var g = img.data[i + 1];
            var b = img.data[i + 2];
            if (r === BACKGROUND_COLOR && g === BACKGROUND_COLOR && b === BACKGROUND_COLOR || r === 0 && g === 0 && b === 0) continue;

            var _setRecoverColor = function(_img, _orig, _rps, thickness, toedge) {
                if (_rps.length > 0) {
                    var _lidx = _rps[_rps.length - 1];
                    var _lmap = {};
                    _lmap[_lidx] = _lidx;
                    if (!imageUtil.isPixelBlackOrWhite(_orig, _lidx) && imageUtil.inBlackWhilte(_orig, _lmap)) {
                        _rps = _rps.slice(0, _rps.length - 1);
                    }

                    var minlen = 7 - thickness - (toedge > 3 ? 0 : (3 - toedge));
                    var blackEndStart = -1;
                    for (var _b = _rps.length - 1; _b >= 0; _b--) {
                        if (imageUtil.isPixelBlack(_orig, _rps[_b])) {
                            blackEndStart = _b;
                        } else {
                            break;
                        }
                    }
                    var blackStart = -1;
                    var len = _rps.length;
                    for (var j = 0; j < len; j++) {
                        var ri = _rps[j];
                        if (blackStart < 0 && imageUtil.isPixelBlack(_orig, ri)) {
                            blackStart = j;
                        }

                        var _x = (ri % (_orig.width * 4)) / 4;

                        // if (_x===80) {
                        //     console.log(_x, Math.floor(ri/(_orig.width*4)), j, thickness,toedge, minlen, blackStart, blackEndStart, _rps.length, _orig.data[ri]);
                        // }

                        if (j > minlen) {
                            if (blackStart != -1 && blackStart === blackEndStart && j >= (len - blackStart) / 2) break;

                            if (blackEndStart != -1 && blackEndStart <= j && imageUtil.isPixelBlack(_orig, ri) && imageUtil.isPixelWhite(_img, ri - 4) && imageUtil.isPixelWhite(_img, ri + 4)) {
                                break;
                            }
                        }
                        _img.data[ri] = _orig.data[ri];
                        _img.data[ri + 1] = _orig.data[ri + 1];
                        _img.data[ri + 2] = _orig.data[ri + 2];



                    }
                }
            }


            var upi = imageUtil.getNeighbourPixelIndex(img, i, 0, -1);
            if (imageUtil.isPixelWhite(img, upi)) {
                var rpixels = checkRecoverColorInDirection(i, 0, -1, img, originImage, leftimg, rightimg);
                var fbgi = imageUtil.getFirstBackgroundColorIndex(originImage, i, 0, 1);
                var ey = Math.floor(fbgi / (originImage.width * 4));

                var lfbgi = imageUtil.getFirstBackgroundColorIndex(img, i, -1, 0);
                var lx = imageUtil.getXByIndex(img, lfbgi);
                var rfbgi = imageUtil.getFirstBackgroundColorIndex(img, i, 1, 0);
                var rx = imageUtil.getXByIndex(img, rfbgi);
                // if (x===80 && y==42) console.log("lx rx", lx, rx)
                _setRecoverColor(img, originImage, rpixels, ey - y, Math.min(x - lx, rx - x));
            }

            var downi = imageUtil.getNeighbourPixelIndex(img, i, 0, 1);
            if (imageUtil.isPixelWhite(img, downi)) {
                var rpixels = checkRecoverColorInDirection(i, 0, 1, img, originImage, leftimg, rightimg);
                var fbgi = imageUtil.getFirstBackgroundColorIndex(originImage, i, 0, -1);
                var ey = Math.floor(fbgi / (originImage.width * 4));
                var lfbgi = imageUtil.getFirstBackgroundColorIndex(img, i, -1, 0);
                var lx = imageUtil.getXByIndex(img, lfbgi);
                var rfbgi = imageUtil.getFirstBackgroundColorIndex(img, i, 1, 0);
                var rx = imageUtil.getXByIndex(img, rfbgi);

                _setRecoverColor(img, originImage, rpixels, y - ey, Math.min(x - lx, rx - x));
            }

        }
    }

}

function checkRecoverColorInDirection(idx, h, v, img, origImg, leftImg, rightImg) {
    //var tgtidx = imageUtil.getNeighbourPixelIndex(img, idx, h, v);
    //var tgtrgb = [origImg.data[tgtidx], origImg.data[tgtidx+1], origImg.data[tgtidx+2]];
    var srcrgb = [img.data[idx], img.data[idx + 1], img.data[idx + 2]];
    var recoverPixels = [];
    //if (imageUtil.isPixelWhite(origImg, tgtidx)) return recoverPixels;

    for (var i = 1; i < 30; i++) {
        var newidx = idx + h * i * 4 + v * i * 4 * img.width;
        var x = (newidx % (origImg.width * 4)) / 4;
        var y = Math.floor(newidx / (origImg.width * 4))
        if ((imageUtil.isPixelWhite(img, newidx) || i > 1) && !imageUtil.isPixelWhite(origImg, newidx) && (!leftImg || imageUtil.isPixelWhite(leftImg, newidx)) && (!rightImg || imageUtil.isPixelWhite(rightImg, newidx))) {
            // if (y===21) console.log(x, y, origImg.data[newidx])
            recoverPixels.push(newidx);
            if (imageUtil.isPixelWhite(img, newidx)) {
                continue;
            }
        }

        if ((!leftImg || imageUtil.isPixelWhite(leftImg, newidx)) && (!rightImg || imageUtil.isPixelWhite(rightImg, newidx))) {
            // if (x===36) console.log("recoverPixels1", x, y, recoverPixels.length, !leftImg, !rightImg, imageUtil.isPixelWhite(rightImg, newidx))
            return recoverPixels;
        } else if (leftImg && !imageUtil.isPixelWhite(leftImg, newidx)) {
            for (var j = 0; j < recoverPixels.length; j++) {
                var ridx = recoverPixels[j];
                var rrgb = [origImg.data[ridx], origImg.data[ridx + 1], origImg.data[ridx + 2]];
                var distance = distanceIn3D(rrgb, srcrgb);
                var distanceleft = distanceIn3D(rrgb, [leftImg.data[newidx], leftImg.data[newidx + 1], leftImg.data[newidx + 2]]);
                if (distance < distanceleft) continue;
                else {
                    recoverPixels = recoverPixels.slice(0, j);
                    break;
                }
            }
            return recoverPixels;
        } else if (rightImg && !imageUtil.isPixelWhite(rightImg, newidx)) {
            for (var j = 0; j < recoverPixels.length; j++) {
                var ridx = recoverPixels[j];
                var rrgb = [origImg.data[ridx], origImg.data[ridx + 1], origImg.data[ridx + 2]];
                var distance = distanceIn3D(rrgb, srcrgb);
                var distanceright = distanceIn3D(rrgb, [rightImg.data[newidx], rightImg.data[newidx + 1], rightImg.data[newidx + 2]]);
                if (distance < distanceright) continue;
                else {
                    recoverPixels = recoverPixels.slice(0, j);
                    break;
                }
            }
            return recoverPixels;
        }
    }


    if (i > 20) {

        console.log("ERROR:**********************************************checkRecoverColorInDirection i>18", i, x, y, recoverPixels.length)
            //     Math.floor(newidx/(origImg.width*4)), (newidx%(origImg.width*4))/4, recoverPixels.length);
            // process.exit(1);

    }
    return recoverPixels;
}

exports.recoverColorInRange = recoverColorInRange;

function recoverColorInRange(img, leftimg, rightimg, originImage) {
    var range = imageUtil.pixelRange(img);
    var offset = 10;
    var recoverMap = {};
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var i = x * 4 + y * 4 * img.width;
            var r = img.data[i];
            var g = img.data[i + 1];
            var b = img.data[i + 2];
            if (r !== BACKGROUND_COLOR || g !== BACKGROUND_COLOR || b !== BACKGROUND_COLOR) continue;

            if (leftimg) {
                var lr = leftimg.data[i];
                var lg = leftimg.data[i + 1];
                var lb = leftimg.data[i + 2];
                if (lr !== BACKGROUND_COLOR || lg !== BACKGROUND_COLOR || lb !== BACKGROUND_COLOR) continue;
            }
            if (rightimg) {
                var rr = rightimg.data[i];
                var rg = rightimg.data[i + 1];
                var rb = rightimg.data[i + 2];
                if (rr !== BACKGROUND_COLOR || rg !== BACKGROUND_COLOR || rb !== BACKGROUND_COLOR) continue;
            }


            img.data[i] = originImage.data[i];
            img.data[i + 1] = originImage.data[i + 1];
            img.data[i + 2] = originImage.data[i + 2];
        }
    }

}

function isNoiseLine(img, i, range) {
    if (range === undefined) range = 110;
    var r = img.data[i];
    var g = img.data[i + 1];
    var b = img.data[i + 2];

    if (imageUtil.isPixelWhite(img, i)) return false;

    return (Math.abs(r - g) <= 40 && Math.abs(r - b) <= 40 && Math.abs(b - g) <= 40 && Math.max(r, Math.max(b, g)) <= range);

}

exports.recoverImage = recoverImage;

function recoverImage(img, origImage) {
    var range = imageUtil.pixelRange(img);
    var offset = 0;
    var recoverMap = {};
    for (var x = 0; x < img.width; x++) {
        if (x < range.left - offset || x > range.right + offset) continue;
        for (var y = 0; y < img.height; y++) {
            if (y < range.top - offset || y > range.bottom + offset) continue;
            var i = x * 4 + y * 4 * img.width;
            var r = img.data[i];
            var g = img.data[i + 1];
            var b = img.data[i + 2];
            if (r === BACKGROUND_COLOR && g === BACKGROUND_COLOR && b === BACKGROUND_COLOR) continue;

            var lefti = imageUtil.getNeighbourPixelIndex(img, i, -1, 0);
            if (lefti > -1) {
                var leftr = img.data[lefti];
                var leftg = img.data[lefti + 1];
                var leftb = img.data[lefti + 2];
                var oleftr = origImage.data[lefti];
                var oleftg = origImage.data[lefti + 1];
                var oleftb = origImage.data[lefti + 2];
                if (leftr === BACKGROUND_COLOR && leftg === BACKGROUND_COLOR && leftb === BACKGROUND_COLOR && (oleftr !== BACKGROUND_COLOR || oleftg !== BACKGROUND_COLOR || oleftb !== BACKGROUND_COLOR)) {
                    recoverMap[lefti] = lefti;
                }
            }

            var righti = imageUtil.getNeighbourPixelIndex(img, i, 1, 0);
            if (righti > -1) {
                var rightr = img.data[righti];
                var rightg = img.data[righti + 1];
                var rightb = img.data[righti + 2];
                var orightr = origImage.data[righti];
                var orightg = origImage.data[righti + 1];
                var orightb = origImage.data[righti + 2];
                if (rightr === BACKGROUND_COLOR && rightg === BACKGROUND_COLOR && rightb === BACKGROUND_COLOR && (orightr !== BACKGROUND_COLOR || orightg !== BACKGROUND_COLOR || orightb !== BACKGROUND_COLOR)) {
                    recoverMap[righti] = righti;
                }
            }

            var upi = imageUtil.getNeighbourPixelIndex(img, i, 0, -1);
            if (upi > -1) {
                var upr = img.data[upi];
                var upg = img.data[upi + 1];
                var upb = img.data[upi + 2];
                var oupr = origImage.data[upi];
                var oupg = origImage.data[upi + 1];
                var oupb = origImage.data[upi + 2];
                if (upr === BACKGROUND_COLOR && upg === BACKGROUND_COLOR && upb === BACKGROUND_COLOR && (oupr !== BACKGROUND_COLOR || oupg !== BACKGROUND_COLOR || oupb !== BACKGROUND_COLOR)) {
                    recoverMap[upi] = upi;
                }
            }

            var downi = imageUtil.getNeighbourPixelIndex(img, i, 0, 1);
            if (downi > -1) {
                var downr = img.data[downi];
                var downg = img.data[downi + 1];
                var downb = img.data[downi + 2];
                var odownr = origImage.data[downi];
                var odowng = origImage.data[downi + 1];
                var odownb = origImage.data[downi + 2];
                if (downr === BACKGROUND_COLOR && downg === BACKGROUND_COLOR && downb === BACKGROUND_COLOR && (odownr !== BACKGROUND_COLOR || odowng !== BACKGROUND_COLOR || odownb !== BACKGROUND_COLOR)) {
                    recoverMap[downi] = downi;
                }
            }

        }
    }

    for (var att in recoverMap) {
        var idx = recoverMap[att];
        img.data[idx] = origImage.data[idx];
        img.data[idx + 1] = origImage.data[idx + 1];
        img.data[idx + 2] = origImage.data[idx + 2];
    }

}

exports.removeOnePixelColorOnNoise = removeOnePixelColorOnNoise;

function removeOnePixelColorOnNoise(imageData) {
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            if (r === 0 && g === 0 && b === 0 || r === BACKGROUND_COLOR && g === BACKGROUND_COLOR && b === BACKGROUND_COLOR) continue;

            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            var upr = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi];
            var upg = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi + 1];
            var upb = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi + 2];
            if (upr !== upg || upr !== upb || upr !== 0 && upr !== BACKGROUND_COLOR) continue;

            var lefti = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            var leftr = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti];
            var leftg = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti + 1];
            var leftb = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti + 2];
            if (leftr !== leftg || leftr !== leftb || leftr !== 0 && leftr !== BACKGROUND_COLOR) continue;

            var righti = imageUtil.getNeighbourPixelIndex(imageData, i, 1, 0);
            var rightr = righti === -1 ? BACKGROUND_COLOR : imageData.data[righti];
            var rightg = righti === -1 ? BACKGROUND_COLOR : imageData.data[righti + 1];
            var rightb = righti === -1 ? BACKGROUND_COLOR : imageData.data[righti + 2];
            if (rightr !== rightg || rightr !== rightb || rightr !== 0 && rightr !== BACKGROUND_COLOR) continue;

            var downi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, 1);
            var downr = downi === -1 ? BACKGROUND_COLOR : imageData.data[downi];
            var downg = downi === -1 ? BACKGROUND_COLOR : imageData.data[downi + 1];
            var downb = downi === -1 ? BACKGROUND_COLOR : imageData.data[downi + 2];
            if (downr !== downg || downr !== downb || downr !== 0 && downr !== BACKGROUND_COLOR) continue;

            imageData.data[i] = BACKGROUND_COLOR;
            imageData.data[i + 1] = BACKGROUND_COLOR;
            imageData.data[i + 2] = BACKGROUND_COLOR;
            imageData.data[i + 3] = BACKGROUND_COLOR;
        }
    }
}

exports.removeNoisePIxels = removeNoisePIxels;

function removeNoisePIxels(imageData) {
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            if (!(r === 0 && g === 0 && b === 0)) continue;

            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            var upr = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi];
            var upg = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi + 1];
            var upb = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi + 2];
            if (upr !== upg || upr !== upb || upr !== BACKGROUND_COLOR) continue;

            var fdi = imageUtil.getFirstDiffColorIndex(imageData, i, 0, 1);
            var fdr = fdi === -1 ? BACKGROUND_COLOR : imageData.data[fdi];
            var fdg = fdi === -1 ? BACKGROUND_COLOR : imageData.data[fdi + 1];
            var fdb = fdi === -1 ? BACKGROUND_COLOR : imageData.data[fdi + 2];
            if (fdr !== fdg || fdr !== fdb || fdr !== BACKGROUND_COLOR) continue;

            var lefti = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            var leftr = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti];
            var leftg = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti + 1];
            var leftb = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti + 2];

            var righti = imageUtil.getNeighbourPixelIndex(imageData, i, 1, 0);
            var rightr = righti === -1 ? BACKGROUND_COLOR : imageData.data[righti];
            var rightg = righti === -1 ? BACKGROUND_COLOR : imageData.data[righti + 1];
            var rightb = righti === -1 ? BACKGROUND_COLOR : imageData.data[righti + 2];

            // var downi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, 1); 
            // var downr = downi===-1 ? BACKGROUND_COLOR : imageData.data[downi];
            // var downg = downi===-1 ? BACKGROUND_COLOR : imageData.data[downi+1];
            // var downb = downi===-1 ? BACKGROUND_COLOR : imageData.data[downi+2];

            if (upr === BACKGROUND_COLOR && upg === BACKGROUND_COLOR && upb === BACKGROUND_COLOR && leftr === BACKGROUND_COLOR && leftg === BACKGROUND_COLOR && leftb === BACKGROUND_COLOR
                // || leftr===BACKGROUND_COLOR && leftg===BACKGROUND_COLOR && leftb===BACKGROUND_COLOR
                // && downr===BACKGROUND_COLOR && downg===BACKGROUND_COLOR && downb===BACKGROUND_COLOR
                || upr === BACKGROUND_COLOR && upg === BACKGROUND_COLOR && upb === BACKGROUND_COLOR && rightr === BACKGROUND_COLOR && rightg === BACKGROUND_COLOR && rightb === BACKGROUND_COLOR
                // || rightr===BACKGROUND_COLOR && rightg===BACKGROUND_COLOR && rightb===BACKGROUND_COLOR
                // && downr===BACKGROUND_COLOR && downg===BACKGROUND_COLOR && downb===BACKGROUND_COLOR
            ) {
                imageData.data[i] = BACKGROUND_COLOR;
                imageData.data[i + 1] = BACKGROUND_COLOR;
                imageData.data[i + 2] = BACKGROUND_COLOR;
                imageData.data[i + 3] = BACKGROUND_COLOR;
                if (rightr === BACKGROUND_COLOR && rightg === BACKGROUND_COLOR && rightb === BACKGROUND_COLOR
                    // && downr===BACKGROUND_COLOR && downg===BACKGROUND_COLOR && downb===BACKGROUND_COLOR
                    // && upr===BACKGROUND_COLOR && upg===BACKGROUND_COLOR && upb===BACKGROUND_COLOR
                ) {
                    x = Math.max(0, x - 2);
                    y = -1;
                }
            }

        }
    }
}

exports.vRemoveNoisePIxels = vRemoveNoisePIxels;

function vRemoveNoisePIxels(imageData, noiseSize) {
    var noiseStart = false;
    var noiseIdxs = [];
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            var upi = imageUtil.getNeighbourPixelIndex(imageData, i, 0, -1);
            var upr = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi];
            var upg = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi + 1];
            var upb = upi === -1 ? BACKGROUND_COLOR : imageData.data[upi + 2];

            var lefti = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            var leftr = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti];
            var leftg = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti + 1];
            var leftb = lefti === -1 ? BACKGROUND_COLOR : imageData.data[lefti + 2];

            if (r === 0 && g === 0 && b === 0 && upr === BACKGROUND_COLOR && upg === BACKGROUND_COLOR && upb === BACKGROUND_COLOR) {
                noiseStart = true;
                noiseIdxs = [i];
            } else if (noiseStart && r === 0 && g === 0 && b === 0 && upr === 0 && upg === 0 && upb === 0) {
                noiseIdxs.push(i);
            } else if (noiseStart && r === BACKGROUND_COLOR && g === BACKGROUND_COLOR && b === BACKGROUND_COLOR && upr === 0 && upg === 0 && upb === 0) {
                if (noiseIdxs.length < noiseSize) {
                    for (var ni = 0; ni < noiseIdxs.length; ni++) {
                        var __i = noiseIdxs[ni];
                        imageData.data[__i] = 255;
                        imageData.data[__i + 1] = 255;
                        imageData.data[__i + 2] = 255;
                    }

                }
                noiseStart = false;
            } else {
                noiseStart = false;
                noiseIdxs = [];
            }

        }
    }
}

exports.hRemoveNoisePIxels = hRemoveNoisePIxels;

function hRemoveNoisePIxels(imageData, noiseSize) {
    var noiseStart = false;
    var noiseIdxs = [];
    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var i = x * 4 + y * 4 * imageData.width;
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            var _i = imageUtil.getNeighbourPixelIndex(imageData, i, -1, 0);
            var _r = _i === null ? BACKGROUND_COLOR : imageData.data[_i];
            var _g = _i === null ? BACKGROUND_COLOR : imageData.data[_i + 1];
            var _b = _i === null ? BACKGROUND_COLOR : imageData.data[_i + 2];

            if (r === 0 && g === 0 && b === 0 && _r === BACKGROUND_COLOR && _g === BACKGROUND_COLOR && _b === BACKGROUND_COLOR) {
                noiseStart = true;
                noiseIdxs = [i];
            } else if (noiseStart && r === 0 && g === 0 && b === 0 && _r === 0 && _g === 0 && _b === 0) {
                noiseIdxs.push(i);
            } else if (noiseStart && r === BACKGROUND_COLOR && g === BACKGROUND_COLOR && b === BACKGROUND_COLOR && _r === 0 && _g === 0 && _b === 0) {
                for (var ni = 0; noiseIdxs.length < noiseSize && ni < noiseIdxs.length; ni++) {
                    var __i = noiseIdxs[ni];
                    imageData.data[__i] = 255;
                    imageData.data[__i + 1] = 255;
                    imageData.data[__i + 2] = 255;
                }
                noiseStart = false;
            } else {
                noiseStart = false;
                noiseIdxs = [];
            }

        }
    }
}

function groupColorsIn3D(imageData, pixelMap) {
    var colorGroups = {};
    var colorKeys = [];
    for (var att in pixelMap) {
        var i = pixelMap[att];
        var r = imageData.data[i];
        var g = imageData.data[i + 1];
        var b = imageData.data[i + 2];

        if (r === g && r === b) continue;

        var key = r + "_" + g + "_" + b;
        if (!colorGroups[key]) {
            colorKeys.push(key);
            colorGroups[key] = 0;
        }
        colorGroups[key]++;
    }

    colorKeys.sort(function(k1, k2) {
        if (colorGroups[k1] > colorGroups[k2]) return -1;
        else if (colorGroups[k1] < colorGroups[k2]) return 1;
        else return 0;
    })

    // console.log("\nsorted groupKeys:", colorKeys.toString())
    // console.log(colorKeys[0], colorGroups[colorKeys[0]]
    //      , colorKeys[1]?(colorKeys[1]+" "+colorGroups[colorKeys[1]]):""
    //      , colorKeys[2]?(colorKeys[2]+" "+colorGroups[colorKeys[2]]):""
    //  , colorKeys[3]?(colorKeys[3]+" "+colorGroups[colorKeys[3]].length):""
    //  , colorKeys[4]?(colorKeys[4]+" "+colorGroups[colorKeys[4]].length):""
    // , colorKeys[5]?(colorKeys[5]+" "+colorGroups[colorKeys[5]].length):""
    // , colorKeys[6]?(colorKeys[6]+" "+colorGroups[colorKeys[6]].length):""
    // , colorKeys[7]?(colorKeys[7]+" "+colorGroups[colorKeys[7]].length):""
    // , colorKeys[8]?(colorKeys[8]+" "+colorGroups[colorKeys[8]].length):""
    // )

    var corekey0 = colorKeys[0];
    var rgbarr0 = corekey0.split("_");
    var corergb0 = [Number(rgbarr0[0]), Number(rgbarr0[1]), Number(rgbarr0[2])];
    var corekey1;
    for (var i = 1; i < colorKeys.length; i++) {
        var rgb = colorKeys[i].split('_');
        var rgbv = [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])]
        if (distanceIn3D(corergb0, rgbv) > GROUP_COLOR_MIN_DISTANCE) {
            corekey1 = colorKeys[i];
            // console.log(corekey0, corekey1, colorGroups[corekey1], GROUP_COLOR_MIN_DISTANCE, distanceIn3D(corergb0, rgbv))
            break;
        }
    }

    if (!corekey1 || colorGroups[corekey1] < COLOR_GROUP_MIN) return [pixelMap];

    var rgbarr1 = corekey1.split('_');
    var corergb1 = [Number(rgbarr1[0]), Number(rgbarr1[1]), Number(rgbarr1[2])];
    // console.log("core distance:****", corergb0, corergb1)
    var colorGroup0 = {},
        colorGroup1 = {};
    var groupLen0 = 0,
        groupLen1 = 0;
    var xsum0 = 0,
        xsum1 = 0;
    for (var att in pixelMap) {
        var i = pixelMap[att];
        var x = (i % (4 * imageData.width)) / 4;
        var r = imageData.data[i];
        var g = imageData.data[i + 1];
        var b = imageData.data[i + 2];
        var dist0 = distanceIn3D(corergb0, [r, g, b]);
        if (dist0 <= GROUP_COLOR_MIN_DISTANCE) {
            colorGroup0[i] = i;
            groupLen0++;
            xsum0 += x;
        }
        var dist1 = distanceIn3D(corergb1, [r, g, b]);
        if (dist1 <= GROUP_COLOR_MIN_DISTANCE) {
            colorGroup1[i] = i;
            groupLen1++;
            xsum1 += x;
        }
    }
    if (groupLen0 < MINIMUM_CHAR_PIXEL) return [pixelMap];
    else if (groupLen1 < MINIMUM_CHAR_PIXEL) return [pixelMap];
    else {
        var group0 = {},
            group1 = {};
        for (var att in pixelMap) {
            if (colorGroup0[att] === undefined) group1[att] = pixelMap[att];
            if (colorGroup1[att] === undefined) group0[att] = pixelMap[att];
        }

        var avex0 = xsum0 / groupLen0;
        var avex1 = xsum1 / groupLen1;
        return avex0 < avex1 ? [group0, group1] : [group1, group0];
    }
}

function distanceIn3DByColorKey(key0, key1) {
    var rgb0 = key0.split('_');
    var rgb0 = [Number(rgb0[0]), Number(rgb0[1]), Number(rgb0[2])];

    var rgb1 = key1.split('_');
    var rgb1 = [Number(rgb1[0]), Number(rgb1[1]), Number(rgb1[2])];

    return distanceIn3D(rgb0, rgb1);
}

function distanceIn3D(p0, p1) {
    return Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2) + Math.pow(p0[2] - p1[2], 2));
}

function isolatedCharactors(imageData) {
    var detectedMap = {};
    var charMaps = [];
    var smallMaps = [];
    
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageUtil.isPixelWhite(imageData, i) || detectedMap[i] != undefined) continue;

            var clrMap = {};
            var count = imageUtil.detectIslet(imageData, x, y, clrMap, detectedMap);
            // for (var att in clrMap) {
            //     detectedMap[att] = clrMap[att];
            //     count++;
            // }
            // console.log("---------------------------", count)
            if (count > MINIMUM_CHAR_PIXEL) charMaps.push(clrMap);
            else smallMaps.push(clrMap);
        }
    }



    var imgs = [];
    for (var i = 0; i < charMaps.length; i++) {
        var img = imageUtil.getSubImage(imageData, charMaps[i]);
        var ckey = imageUtil.getMajorColorKey(img);
        for (var j = 0; j < smallMaps.length; j++) {
            var isletDist = imageUtil.getIsletsMinDistance(imageData,  smallMaps[j], charMaps[i])
        
            if (isletDist > 6) continue;
            startTime = new Date(); 
            var smallimage = imageUtil.getSubImage(imageData, smallMaps[j]);
        
            var ckeysmall = imageUtil.getMajorColorKey(smallimage);
            var dist = distanceIn3DByColorKey(ckey, ckeysmall);
            if (dist < 40) {
                imageUtil.addToImage(img, smallimage);
            }

        }
       
        imgs.push(img);
    }
    
    return imgs;
}

function groupXDistance(imageData, g0, g1) {
    var sumx0 = 0;
    for (var i = 0; i < g0.length; i++) {
        var idx = g0[i];
        sumx0 += (idx % (4 * imageData.width)) / 4;
    }
    var avex0 = sumx0 / g0.length;
    var sumx1 = 0;
    for (var i = 0; i < g1.length; i++) {
        var idx = g1[i];
        sumx1 += (idx % (4 * imageData.width)) / 4;
    }
    var avex1 = sumx1 / g1.length;
    return Math.abs(avex0 - avex1);
}

function generateCharactorImageWithNoPadding(imageData, pixelMap) {
    var left = Infinity,
        right = -1,
        top = Infinity,
        bottom = -1;
    for (var att in pixelMap) {
        var idx = pixelMap[att];
        var x = (idx % (4 * imageData.width)) / 4;
        var y = Math.floor(idx / (4 * imageData.width));
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
    }

    var newImage = {
        width: right - left + 1,
        height: bottom - top + 1,
        data: []
    };
    for (var y = 0; y < newImage.height; y++) {
        for (var x = 0; x < newImage.width; x++) {
            var i = (x + left) * 4 + (y + top) * 4 * imageData.width;
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
    // console.log("generateCharactorImage", newImage.width, newImage.height, newImage.data.length, newImage.data[newImage.data.length-1]);
    return newImage;
}


exports.removeThinPixels = removeThinPixels;

function removeThinPixels(imageData) {
    var detectedMap = {};
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] === BACKGROUND_COLOR && imageData.data[i + 1] === BACKGROUND_COLOR && imageData.data[i + 2] === BACKGROUND_COLOR) {
                continue;
            }

            if (imageUtil.isThinPixel(i, imageData)) {
                detectedMap[i] = i;
                //imageUtil.setPixelColor(imageData, x, y, BACKGROUND_COLOR, BACKGROUND_COLOR, BACKGROUND_COLOR)
            }
        }
    }

    for (var att in detectedMap) {
        var idx = detectedMap[att];
        imageData.data[idx] = BACKGROUND_COLOR;
        imageData.data[idx + 1] = BACKGROUND_COLOR;
        imageData.data[idx + 2] = BACKGROUND_COLOR;
    }
    return detectedMap;
}

exports.vRemoveFarPixels = vRemoveFarPixels;

function vRemoveFarPixels(imageData) {
    var yMap = {};
    var ymaxPixels = 0,
        maxY;
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            if (yMap[y] === undefined) yMap[y] = 0;
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR || imageData.data[i + 1] !== BACKGROUND_COLOR || imageData.data[i + 2] !== BACKGROUND_COLOR) {
                yMap[y]++;
                if (yMap[y] > ymaxPixels) {
                    ymaxPixels = yMap[y];
                    maxY = y;
                }
            }
        }
    }

    var bottom = imageData.height - 1;
    var gapwidth = 0;
    for (var i = maxY; i < imageData.height; i++) {
        if (yMap[i] === 0) {
            gapwidth++;
        } else {
            gapwidth = 0;
        }
        if (gapwidth === 10) {
            bottom = i;
            break;
        }
    }
    gapwidth = 0;
    var top = 0;
    for (var i = maxY; i >= 0; i--) {
        if (yMap[i] === 0) {
            gapwidth++;
        } else {
            gapwidth = 0;
        }
        if (gapwidth === 10) {
            top = i;
            break;
        }
    }


    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            if (y >= top && y <= bottom) continue;
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR || imageData.data[i + 1] !== BACKGROUND_COLOR || imageData.data[i + 2] !== BACKGROUND_COLOR) {
                imageData.data[i] = BACKGROUND_COLOR;
                imageData.data[i + 1] = BACKGROUND_COLOR;
                imageData.data[i + 2] = BACKGROUND_COLOR;
            }
        }
    }

}

exports.hScanForCharactorImages = hScanForCharactorImages;

function hScanForCharactorImages(imageData) {

    var xgapwidth = 0;
    var charPassed = false;
    var seqPixelCount = 0;
    var x = 0;
    var pixelMap = {};
    var imgs = [];
    for (x = 0; x < imageData.width; x++) {
        var xcount = 0;
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR || imageData.data[i + 1] !== BACKGROUND_COLOR || imageData.data[i + 2] !== BACKGROUND_COLOR) {
                xcount++;
                pixelMap[i] = i;
            }
        }

        if (xcount > 3) {
            seqPixelCount += xcount;
            xgapwidth = 0;
        } else {
            if (xgapwidth > 10) seqPixelCount = 0;
            xgapwidth++;
        }

        if (seqPixelCount > 200) charPassed = true;

        if ((xgapwidth > 10 || x === imageData.width - 1) && charPassed) {
            var img = imageUtil.getSubImage(imageData, pixelMap);
            imgs.push(img);
            seqPixelCount = 0;
            charPassed = false;
            pixelMap = {};
        }

    }

    return imgs

}


exports.hRemoveFarPixels = hRemoveFarPixels;

function hRemoveFarPixels(imageData) {
    var xMap = {};
    var xmaxPixels = 0,
        maxX;

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;
            if (xMap[x] === undefined) xMap[x] = 0;
            if (imageData.data[i] !== BACKGROUND_COLOR || imageData.data[i + 1] !== BACKGROUND_COLOR || imageData.data[i + 2] !== BACKGROUND_COLOR) {
                xMap[x]++;
                if (xMap[x] > xmaxPixels) {
                    xmaxPixels = xMap[x];
                    maxX = x;

                }

            }
        }
    }
    var left = 0;
    var gapwidth = 0;
    for (var i = maxX; i >= 0; i--) {
        if (xMap[i] === 0) {
            gapwidth++;
        } else {
            gapwidth = 0;
        }
        if (gapwidth === 10) {
            left = i + 10;
            break;
        }
    }

    gapwidth = 0;
    var right = imageData.width - 1;
    for (var i = maxX; i < imageData.width; i++) {
        if (xMap[i] === 0) {
            gapwidth++;
        } else {
            gapwidth = 0;
        }
        if (gapwidth === 10) {
            right = i - 10;
            break;
        }
    }

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            if (x >= left && x <= right) continue;
            var i = x * 4 + y * 4 * imageData.width;
            if (imageData.data[i] !== BACKGROUND_COLOR || imageData.data[i + 1] !== BACKGROUND_COLOR || imageData.data[i + 2] !== BACKGROUND_COLOR) {
                imageData.data[i] = BACKGROUND_COLOR;
                imageData.data[i + 1] = BACKGROUND_COLOR;
                imageData.data[i + 2] = BACKGROUND_COLOR;
            }
        }
    }

}

// exports.removeNoiseIslet = removeNoiseIslet;

// function removeNoiseIslet(imageData) {
//     var detectedMap = {};
//     for (var x = 0; x < imageData.width; x++) {
//         for (var y = 0; y < imageData.height; y++) {
//             var i = x * 4 + y * 4 * imageData.width;
//             if (detectedMap[i] !== undefined) continue;

//             if (imageData.data[i] === 0 && imageData.data[i + 1] === 0 && imageData.data[i + 2] === 0) {

//                 var noiseMap = {};
//                 imageUtil.detectIslet(imageData, x, y, noiseMap, BACKGROUND_COLOR);
//                 // var isNoise = true;
//                 for (var _ii in noiseMap) {
//                     detectedMap[_ii] = noiseMap[_ii];
//                 }
//                 var colorPixels = 0;
//                 var noisePixels = 0;
//                 for (var _i in noiseMap) {
//                     var _inum = noiseMap[_i];
//                     if (imageData.data[_inum] !== 0 || imageData.data[_inum + 1] !== 0 || imageData.data[_inum + 2] !== 0) {
//                         // isNoise = false;
//                         // break;
//                         colorPixels++;
//                     } else {
//                         noisePixels++;
//                     }
//                 }

//                 // if (!isNoise) continue;
//                 if (colorPixels > COLOR_ISLET_MAX_NUM || noisePixels > COLOR_ISLET_MAX_NUM || colorPixels > noisePixels) continue;

//                 for (var _i in noiseMap) {
//                     var _inum = noiseMap[_i];
//                     imageData.data[_inum] = BACKGROUND_COLOR;
//                     imageData.data[_inum + 1] = BACKGROUND_COLOR;
//                     imageData.data[_inum + 2] = BACKGROUND_COLOR;
//                 }

//             }
//         }
//     }

// }


exports.removeColorNoiseIslets = removeColorNoiseIslets;

function removeColorNoiseIslets(imageData, pixelsNum) {
    if (!pixelsNum) pixelsNum = COLOR_ISLET_MAX_NUM
    var detectedPixels = {};
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;

            if (detectedPixels[i] !== undefined || imageUtil.isPixelWhite(imageData, i)) continue;

            var nbrs = {};
            var count = imageUtil.detectIslet(imageData, x, y, nbrs, detectedPixels);

            // var count = 0;
            // for (var att in nbrs) {
            //     detectedPixels[att] = nbrs[att];
            //     count++;
            // }
            
            if (count > pixelsNum) {
                continue;
            }

            for (var att in nbrs) {
                var _i = nbrs[att];
                imageData.data[_i] = BACKGROUND_COLOR;
                imageData.data[_i + 1] = BACKGROUND_COLOR;
                imageData.data[_i + 2] = BACKGROUND_COLOR;
            }
        }
    }
}


exports.removeFarIslets = removeFarIslets;

function removeFarIslets(imageData, size, far) {
    var detectedPixels = {};
    var mainland;
    var mainlandpixels = 0;
    var islets = [];
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var i = x * 4 + y * 4 * imageData.width;

            if (detectedPixels[i] !== undefined || imageData.data[i] === BACKGROUND_COLOR && imageData.data[i + 1] === BACKGROUND_COLOR && imageData.data[i + 2] === BACKGROUND_COLOR) continue;

            var nbrs = {};
            var count = imageUtil.detectIslet(imageData, x, y, nbrs, detectedPixels);

            if (count > mainlandpixels) {
                mainlandpixels = count;
                mainland = nbrs;
            }
            islets.push(nbrs);
        }
    }

    var removed = {};
    for (var i = 0; i < islets.length; i++) {
        if (islets[i] === mainland) continue;
        var il = islets[i];
        var count = 0;
        for (var att in il) {
            count++;
        }

        if (count < size) {
            for (var att in il) {
                removed[att] = il[att];
                imageUtil.setPixelColorByIndex(imageData, il[att], 255, 255, 255)
            }
        } else {
            var distance = imageUtil.getIsletsMinDistance(imageData, islets[i], mainland);
            if (distance >= far) {
                for (var att in il) {
                    removed[att] = il[att];
                    imageUtil.setPixelColorByIndex(imageData, il[att], 255, 255, 255)
                }
            }
        }


    }
    return removed;
}
