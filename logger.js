var filename_log = './logs/logSocket.log';
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath: filename_log,
        timestampFormat: 'YYYY-MM-DD HH:mm:ss'
    }, log = SimpleNodeLogger.createSimpleLogger(opts);

module.exports = log;