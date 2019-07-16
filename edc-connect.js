const serialport = require("serialport");
const log = require("./logger");
const bsplit = require("buffer-split");
const his = require("./his-connect");
var receipt_mas_id = "wait";

console.log("port open");
const port = new serialport(portName, {
  baudRate: 9600,
  parity: "none",
  stopBits: 1,
  dataBits: 8
});

port.on("open", function () {
  document.getElementById("text-connect").innerHTML = "Is Port " + portName + " Connected";
});

port.on("error", function (err) {
  log.error(err.message);
  console.log("Error: ", err.message);
  document.getElementById("text-connect").innerHTML = "Is Port " + portName + " Disconnect!!! check port config";
  // reconnectEdc();
});

port.on("close", function () {
  log.info("Close Connect");
  document.getElementById("text-connect").innerHTML = "Is Port " + portName + " Disconnect!!! check port config";
  // reconnectEdc();
});

//read data
//Switches the port into "flowing mode"
port.on("data", function (data) {
  log.warn("byteReceive", data);
  let dataSendHis = checkReceiveBuffer(data);
  console.log("Data:", dataSendHis);
  if (dataSendHis && dataSendHis.action == 'APPROVED') {
    his.emitSocket("edc_send_apporve", dataSendHis);
  }
});

his.onSocket("edc_receive_order");

const sendMessage = function (data) {
  receipt_mas_id = data.receipt_mas_id;
  console.log(receipt_mas_id);
  //write message Buffer
  var buffer = new Buffer(genMessage(data.price));
  console.log(buffer.toString());
  port.write(buffer, function (err) {
    if (err) {
      log.error(err.message);
      return console.log("Error on write: ", err.message);
    }

    log.info("buffer send complte");
    console.log("buffer message written");
  });
};

function genMessage(price) {
  let intPrice = null, decimalPrice = null;
  let msg = [0x02, 0x00, 0x35, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x30,
    0x31, 0x31, //31,31 read card | 32,36 cancel read card | 39,32 re-print
    0x30, 0x30, 0x30, 0x1C, 0x34, 0x30, 0x00, 0x12];

  //0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x33, 0x32, 0x35, 0x31, 0x37, 0x35  //price 12 digits , 1C end line no price
  intPrice = price.substring(0, price.indexOf(".")).padStart(10, '0');
  decimalPrice = price.substring((price.indexOf(".") + 1));
  for (let i = 0; i < 10; i++) {
    msg.push("0x3".concat(intPrice[i]));
  }
  for (i = 0; i < 2; i++) {
    msg.push("0x3".concat(decimalPrice[i]));
  }
  msg.push(0x1C, 0x03, 0x14);

  return msg;
}

const checkReceiveBuffer = function (data) {
  if (data.length < 2) {
    return;
  }

  if (data) {
    let delim = new Buffer([28]),
      strReceive = bsplit(data, delim),
      fileType,
      strValue,
      strReturn = [];

    for (var i = 0; i < strReceive.length; i++) {
      strReceive[i] = strReceive[i].toString();

      if (strReceive[i].length < 6) {
        continue;
      }
      fileType = strReceive[i].substring(0, 2);
      strValue = strReceive[i].substring(4, strReceive[i].length);

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
    strReturn.push({ receipt_mas_id: receipt_mas_id }); //his data key update
    strReturn = jsonMergeObj(strReturn);
    log.warn("strReceive", strReturn);
    return strReturn;
  }
};

const connectEdc = function () {
  document.getElementById("text-connect").innerHTML = "Is Port " + portName + " Connecting...";
  const port = new serialport(portName, {
    baudRate: 9600,
    parity: "none",
    stopBits: 1,
    dataBits: 8
  });

  port.on("error", function (err) {
    log.error(err.message);
    console.log("Error: ", err.message);
    reconnectEdc();
  });

  port.on("close", function () {
    log.info("Close Connect");
    reconnectEdc();
  });
}

// check for connection errors or drops and reconnect 5 sec
function reconnectEdc() {
  console.log("Initiating reconnect");
  setTimeout(function () {
    const { portlist } = require("./renderer");
    portlist();
    log.info("reconnect");
    connectEdc();
  }, 5000);
}

function jsonMergeObj(obj) {
  const result = {};
  if (obj) {
    Object.keys(obj).map((env, key) => {
      const keys = Object.keys(obj[key]);
      keys.map(k => {
        result[k] = obj[key][k];
      });
    });
  }

  return result;
}

document.getElementById("edc-his").addEventListener("click", function (e) {
  var buffer = new Buffer([2, 1, 68, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 49, 49, 49, 49, 48, 48, 48, 28, 48, 49, 0, 9, 48, 52, 50, 55, 50, 50, 56, 51, 48, 28, 48, 50, 0, 32, 65, 80, 80, 82, 79, 86, 69, 68, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 28, 54, 53, 0, 6, 48, 48, 55, 56, 55, 52, 28, 49, 54, 0, 8, 52, 49, 48, 48, 48, 57, 57, 49, 28, 68, 49, 0, 21, 48, 48, 48, 48, 48, 48, 48, 52, 48, 48, 48, 49, 48, 52, 53, 28, 48, 51, 0, 6, 49, 57, 48, 55, 49, 50, 28, 48, 52, 0, 6, 49, 53, 52, 53, 48, 55, 28, 51, 48, 0, 22, 48, 48, 48, 49, 52, 56, 120, 120, 120, 120, 120, 120, 50, 51, 48, 52, 28, 3, 51]);
  let aa = checkReceiveBuffer(buffer)
  his.emitSocket("edc_send_apporve", aa);
  return;
});

module.exports = {
  connectEdc: connectEdc,
  sendMessage: sendMessage
};
