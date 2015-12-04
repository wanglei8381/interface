var logger = require('./logger')('[service_adapter]');
var http = require('http');

function buildServer(context) {

  function onRequest(request, response) {
    if (request.url == "/favicon.ico")
      return false;

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
          response.end(JSON.stringify({status: "10448", msg: "error"}));
        }
      }).listen(context.port);
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