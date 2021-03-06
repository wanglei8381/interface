var logger = require('./logger')('[Interface][service_adapter]');
var http = require('http');
var cluster = require('cluster');

function buildServer(context) {

  function onRequest(request, response) {
    if (request.url == "/favicon.ico") {
      response.end();
      return false;
    }

    context.handle(request, response);

  }

  try {
    if (context.protocal === 'https') {

    } else {
      http.createServer(function (request, response) {
        try {
          onRequest(request, response);
        } catch (e) {
          logger.error('[buildServer]onRequest', e.stack);
          response.end(JSON.stringify({status: -1, msg: "error"}));
        }
      }).listen(context.port, function () {
        logger.debug('[buildServer][' + context.serviceName + ']Server has started http://127.0.0.1:' + context.port);
      });
    }

  } catch (e) {
    logger.error('[buildServer]', e.stack);
  }

}

function start(manager) {

  var services = manager.services;
  for (var key in services) {
    if (services[key].deploySuccess) {
      buildServer(services[key]);
    }
  }

}

exports.start = start;