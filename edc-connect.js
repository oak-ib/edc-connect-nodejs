const serialport = require("serialport");
const createTable = require("data-table");
const log = require("./logger");
const nconf = require("nconf");
nconf
  .argv()
  .env()
  .file({ file: "config.json" });

document.getElementById("edc-start").addEventListener("click", function(e) {
    connectEdc();
});

var connectEdc = function() {
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
          0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x35, 0x30, 0x30, 0x30, 0x1C, //price 12 digits , 1C end line no price
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
          log.info(data);
          console.log("Data:", data);
          checkReceiveBuffer(data);
      });
}

function checkReceiveBuffer(data){
    if(data.length < 2){
        return;
    }

    if( data ) {

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