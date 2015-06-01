var transferjobs = require("./rrd/transferjobs");

transferjobs.startNewTransferLoop(function(latestTransferObjs){
    console.log("latestTransferObjs:", latestTransferObjs.length, latestTransferObjs[latestTransferObjs.length-1])
})

// var detectlatesttransferid = require("./rrd/detectlatesttransferid");

// detectlatesttransferid(function(latestId){
//     console.log("------------------------------------latestId", latestId)
// }, 1000
// )