require('./global');
var cluster = require('cluster');
var logger = require('./logger')('[interface]');
var Server = require('./server');

if (cluster.isWorker && process.argv[2] === '-w') {

  process.on('message', function (data) {
    if (data.status === '001') {
      start(data.server);
    } else {
      logger.warn('no server');
    }
  });

} else if (cluster.isMaster) {

  exports.Runner = function (server) {
    start(server);
  };

}

function start(server) {

  Server.setLog(server.loglevel);

  try {
    Server.bindingService(server);
  } catch (e) {
    logger.error('[start]', 'binding service', e.stack);
    throw e;
  }

  try {
    Server.start(server);
  } catch (e) {
    logger.error('[start]', 'binding service', e.stack);
    throw e;
  }

}

process.on('uncaughtException', function (err) {
  logger.error("[worker][ERROR]:", err.stack);
});