const log = require("./logger");
const io = require("socket.io-client");
let socket = io.connect(socket_server, {reconnect: true});

const onSocket = function(event) {
    console.log('socket on '+event);
    socket.on(event, data => {
        log.info("hisData", data);
        if (data.receipt_mas_id) {
            const edc = require("./edc-connect");
            edc.sendMessage(data);
        }
    });
};

const emitSocket = function(event,data){
    console.log('socket emit '+event);
    log.info("edcData2His", data);
    socket.emit(event, data);
}

module.exports = {
  onSocket: onSocket,
  emitSocket:emitSocket
};
