require('./lib/global');
var cluster = require('cluster');
var Server = require('./lib/server');
var logger = require('./lib/logger')('[Interface][index]');

exports.Runner = function (path) {
  console.time('Server startup time');

  try {
    if (Object.isEmpty(path)) {
      logger.warn('[start]', 'Server startup failed');
      console.timeEnd('Server startup time');
      return;
    }

    var server = new Server(path);

    if (cluster.isMaster && server.cluster > 1) {

      cluster.setupMaster({
        exec: __dirname + "/lib/interface.js",
        args: ['-w']
      });

      for (var i = 1; i <= server.cluster; i++) {
        cluster.fork();
      }

      cluster.on('online', function (worker) {
        server.workerId = worker.id;
        worker.send({status: '001', server: server});
      });

      cluster.on('listening', function (worker, address) {
        //console.log("一个工作进程服务启动：", 'PID', worker.process.pid, 'address', address.address, 'port', address.port);
      });

      cluster.on('exit', function (worker, code, singal) {
        logger.warn('[start] worker' + worker.id + ' WORKER DIED');
        cluster.fork();
      });

    } else {
      require('./lib/interface').Runner(server);
    }

  } catch (e) {
    logger.error('Server startup failed', e.stack);
  }
  console.timeEnd('Server startup time');
};

process.on('uncaughtException', function (err) {
  logger.error("[master][ERROR]:", err.stack);
});

console.log("-----------------------------------------[Interface] VERSION 0.1.0---------------------------------------------");