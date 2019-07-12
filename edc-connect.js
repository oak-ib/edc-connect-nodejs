const serialport = require("serialport");
const createTable = require("data-table");
const log = require("./logger");
const nconf = require("nconf");
const bsplit = require('buffer-split');
nconf
  .argv()
  .env()
  .file({ file: "config.json" });

document.getElementById("edc-start").addEventListener("click", function(e) {
    connectEdc();
});

var connectEdc = function() {
  console.log('port open');
    const port = new serialport("/dev/tty.usbmodem14401", {
        baudRate: 9600,
        parity: "none",
        stopBits: 1,
        dataBits: 8
      });

      port.on("error", function(err) {
        log.error(err.message);
        console.log("Error: ", err.message);
        // reconnectEdc();
      });

      port.on("close", function() {
        log.info("Close Connect");
        // reconnectEdc();
      });
      
      //write message Buffer
      var buffer = new Buffer([0x02, 0x00, 0x35, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,0x30, 0x31, 0x30, 
          0x31, 0x31, //31,31 read card | 32,36 cancel read card | 39,32 re-print
          0x30,0x30,0x30, 0x1C, 0x34, 0x30, 0x00, 0x12, 
          0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x33, 0x32, 0x35, 0x31, 0x37, 0x35, 0x1C, //price 12 digits , 1C end line no price
          0x03, 0x14 ]);
      //ทดสอบส่งเฉยๆ, ส่งเป็นtextให้ encode hex
      port.write(buffer, function(err) {
          if (err) {
            log.error(err.message);
            return console.log("Error on write: ", err.message);
          }
        
          log.info("buffer send complte");
          console.log("buffer message written");
      });
        
      //read data
      // Switches the port into "flowing mode"
      port.on("data", function(data) {
          log.warn('byteReceive',data);
          console.log("Data:", data);
          let kkk = checkReceiveBuffer(data);
      });
}

function checkReceiveBuffer(data){
    if(data.length < 2){
        return;
    }

    if( data ) {
      let delim = new Buffer([28]),
      strReceive = bsplit(data,delim),
      fileType,strValue,strReturn = [];
      
     for(var i = 0; i < strReceive.length; i++){
       strReceive[i] = strReceive[i].toString();
       
       if (strReceive[i].length < 6){
         continue;
       }
       fileType = strReceive[i].substring(0, 2);
       strValue = strReceive[i].substring(4, strReceive[i].length);
       log.warn('strReceiveLine', 'fileType:' + fileType + 'data:' + strReceive[i]);
       
       switch (fileType) {
        case "01":
          strReturn.push({ app_code: strValue.trim() });
          break;
        case "65":
          strReturn.push({ trace: strValue.trim() });
          break;
        case "30":
          strReturn.push({ cid: strValue.trim() });
          break;
        case "03":
          strReturn.push({ date: strValue.trim() });
          break;
        case "04":
          strReturn.push({ time: strValue.trim() });
          break;
        case "02":
          strReturn.push({ action: strValue.trim() });
          break;
      }
     }
     strReturn = jsonMergeObj(strReturn);
     log.warn('strReceive', strReturn);
     return strReturn
    }
}


// check for connection errors or drops and reconnect 2 sec
var reconnectEdc = function () {
    console.log('Initiating reconnect');
    setTimeout(function(){
        log.info('reconnect');
        connectEdc();
    }, 2000);
  };

  //test
  document.getElementById("edc-test").addEventListener("click", function(e) {
    var buffer = new Buffer([2,1,68,48,48,48,48,48,48,48,48,48,48,49,49,49,49,48,48,48,28,48,49,0,9,48,52,50,55,50,50,56,51,48,28,48,50,0,32,65,80,80,82,79,86,69,68,32,32,32,32,32,32,32,32,32,32,32,32,28,54,53,0,6,48,48,55,56,55,52,28,49,54,0,8,52,49,48,48,48,57,57,49,28,68,49,0,21,48,48,48,48,48,48,48,52,48,48,48,49,48,52,53,28,48,51,0,6,49,57,48,55,49,50,28,48,52,0,6,49,53,52,53,48,55,28,51,48,0,22,48,48,48,49,52,56,120,120,120,120,120,120,50,51,48,52,28,3,51]);
    console.log(buffer.toString('utf8'));
    let aa = checkReceiveBuffer(buffer)
    log.info(aa);
    aa = JSON.stringify(aa);
    return;
});

function jsonMergeObj(obj) {
  const result = {};
  if(obj){
    Object.keys(obj).map((env, key) => {
      const keys = Object.keys(obj[key]);
      keys.map(k => {
        result[k] = obj[key][k];
      });
    });
  }

  return result;
}