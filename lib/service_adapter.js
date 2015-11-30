var logger = require('./logger')('[service_adapter]');
var http = require('http');

function buildServer(context) {

  function onRequest(request, response) {
    if (request.url == "/favicon.ico")
      return false;
    response.setHeader('X-Powered-By', 'Interface');
    response.statusCode = 200;
    response.end('INTERFACE:' + context.port);
  }

  try {
    if (context.protocal === 'https') {

    } else {
      http.createServer(onRequest).listen(context.port);
    }

  } catch (e) {
    logger.error('[buildServer]', e.stack);
  }

}

function start(manager) {

  try {
    var services = manager.services;
    for (var key in services) {
      if (services[key].deploySuccess) {
        buildServer(services[key]);
      }
    }

  } catch (e) {
    logger.error('[start]', e.stack);
  }

}

exports.start = start;