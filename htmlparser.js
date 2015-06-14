
function getValueFromBody(preStr, postStr, body) {
    var startIdx = body.indexOf(preStr);
    if (startIdx < 0) return null;
    var endIdx = body.indexOf(postStr, startIdx);
    if (endIdx < 0) return null;

    var str = body.substring(startIdx + preStr.length, endIdx);
    return str;
}
exports.getValueFromBody = getValueFromBody


function getSubStringsFromBody(preStr, postStr, body) {
    var body = body.replace(/\r\n/g, '');
    var regStr = preStr +'(.*?)'+postStr;
    var reg = new RegExp(regStr, "g");
    var eles = body.match(reg);
    return eles;
}
exports.getSubStringsFromBody = getSubStringsFromBody;