var detectlatesttransferid = require("./rrd/detectlatesttransferid");

detectlatesttransferid(function(latestId){
    console.log("------------------------------------latestId", latestId)
}, 1000
)