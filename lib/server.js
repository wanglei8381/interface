var fs = require('fs');
var os = require('os');
var CPUS_NUM = os.cpus().length;
var path = require('path');
var Service = require('./service');
var serviceAdapter = require('./service_adapter');
var parseJSON = require('./util/parseJSON');
var tools = require('./util/tools');
var Logger = require('./logger');
var logger = Logger('[Interface][server]');


exports = module.exports = Server;

function Server(path) {
  this.workpath = path;
  this.services = {};
  this.confs = {};
  try {
    init(this);
  } catch (e) {
    logger.error('[constructor]', 'Failed to initialize', e.stack);
    throw e;
  }

  logger.debug('[constructor]', 'Initialization configuration success');

  try {
    parseConfig(this);
  } catch (e) {
    logger.error('[constructor]', 'Parsing configuration file', e.stack);
    throw e;
  }

  logger.debug('[constructor]', 'Parsing configuration file success');

  Logger.setLevel(this.loglevel);

}

function init(context) {
  var result1 = result2 = null;

  try {
    result1 = fs.readFileSync(path.resolve(__dirname, '../conf/service.json')).toString();
  } catch (e) {
    logger.fatal('[init]', 'Failed to read the configuration service.json file');
    throw e;
  }

  try {
    result2 = fs.readFileSync(path.join(context.workpath, 'service.json')).toString();
  } catch (e) {
    logger.fatal('[init]', 'Failed to read the user service.json file');
    throw e;
  }

  result1 = parseJSON(result1, 'Parsing configuration service.json file failed');
  result2 = parseJSON(result2, 'Parsing user service.json file failed');

  var templateServer = result1.server;
  var applicationServer = result2.server;
  var templateService = templateServer.service;
  var services = applicationServer.services || [];
  delete templateServer.service;
  delete applicationServer.services;
  tools.extend(context.confs, tools.replace(templateServer, applicationServer, true), false);

  if (!Array.isArray(services)) {
    services = [services];
  }

  context.confs.services = services.map(function (item) {
    return tools.replace(tools.extend(templateService, true), item, true);
  });
}

function parseConfig(context) {

  var confs = context.confs;

  if (Object.isString(confs.name)) {
    context.serverName = confs.name.substr(0, 500);
  } else {
    context.serverName = 'This is an application server';
  }

  if (Object.isEmpty(confs.basedoc)) {
    context.basedoc = context.workpath;
  } else {
    if (path.existsSync(confs.basedoc) && path.isAbsolute(confs.basedoc)) {
      context.basedoc = confs.basedoc;
    }
  }

  context.cluster = 1;
  context.CPUS_NUM = CPUS_NUM;
  if (!Object.isEmpty(confs.cluster)) {
    var cluster = parseInt(confs.cluster);
    if (Object.isNumber(cluster)) {
      cluster = cluster < 1 ? 1 : cluster > CPUS_NUM ? CPUS_NUM : cluster;
      context.cluster = cluster;
    }
  }

  context.loglevel = 2;
  if (!Object.isEmpty(confs.loglevel)) {
    var loglevel = parseInt(confs.loglevel);
    if (Object.isNumber(loglevel)) {
      loglevel = loglevel < 1 ? 1 : loglevel > 7 ? 7 : loglevel;
      context.loglevel = loglevel;
    }
  }

  context.multipartResolver = confs.multipartResolver;
}

Server.bindingService = function (context) {
  var services = context.confs.services;
  if (!Object.isEmpty(services)) {
    services.forEach(function (item, index) {
      var service = new Service(context, item);
      var serviceName = service.serviceName;
      if (!service.deploySuccess) {
        serviceName = 'service_name_' + (index + 1);
        logger.warn('[bindingService]', 'Failed to load ' + serviceName + ':', service.deployInfo);
      } else {
        logger.debug('[bindingService]', 'PID', process.pid, 'Service_Name:', serviceName, 'ok');
      }
      service.deployOrder = index + 1;
      context.services[serviceName] = service;
      service.parentContext = context;
    });
  }
};

Server.setLog = function (logLevel) {

  Logger.setLevel(logLevel);

};

Server.start = function (context) {

  serviceAdapter.start(context);

};