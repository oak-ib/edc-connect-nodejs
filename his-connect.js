const log = require("./logger");
const io = require("socket.io-client");
const ip = require('ip');
let socket = io.connect(socket_server, {reconnect: true});

socket.on('connect', function() {
    // Connected, let's sign-up for to receive messages for this room
    let valIp = ip.address().split('.');
    log.info("IP", valIp);
    socket.emit('room', valIp[3]);
});

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
