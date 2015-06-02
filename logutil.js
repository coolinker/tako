
exports.log = log;
function log(methodName) {
    var str = "";
    for(var i=1;i<arguments.length;i++){
            str+=arguments[i];
            if (i < arguments.length-1) str += ", ";
    }
    console.log("\n"+logPrefix(methodName) + str);
}

function logPrefix(methodName) {
    return new Date().toLocaleTimeString()+" " + methodName  + ": ";
}