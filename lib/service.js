var path = require('path');
var fs = require('fs');
var logger = require('./logger')('[service]');

var identifierReg = /^[a-zA-Z_]+[a-zA-Z_1-9]*$/;

module.exports = function (manager, confs) {
  this.deploySuccess = true;
  this.confs = confs;

  try {
    parseConfig(manager, this);
  } catch (e) {
    this.deploySuccess = false;
    logger.error('[constructor]', 'Parsing configuration file', e.stack);
  }

};

function parseConfig(manager, context) {
  var services = manager.services;
  var confs = context.confs;

  var isExistProject = function (project) {
    for (var key in services) {
      if (services[key].project === project) {
        return true;
      }
    }
  };

  var isExistPath = function (path) {
    for (var key in services) {
      if (services[key].path === path) {
        return true;
      }
    }
  };

  if (!Object.isEmpty(confs.name)) {
    if (identifierReg.test(confs.name)) {
      if (!services.hasOwnProperty(confs.name)) {
        context.serviceName = confs.name;
      } else {
        context.deploySuccess = false;
        context.deployInfo = 'Service name already exists';
      }
    } else {
      context.deploySuccess = false;
      context.deployInfo = 'Service name is not legal';
    }
  } else {
    context.deploySuccess = false;
    context.deployInfo = 'Service name is empty';
  }

  if (!context.deploySuccess) return;

  if (!Object.isEmpty(confs.project)) {
    var basedoc = manager.basedoc;
    basedoc = path.resolve(path.join(basedoc, confs.project));
    if (!isExistProject(basedoc)) {
      var project_interface = path.join(basedoc, 'interface.json');
      if (fs.existsSync(project_interface)) {
        context.project = basedoc;
        context.project_interface = project_interface;
      } else {
        context.deploySuccess = false;
        context.deployInfo = 'Service lacks the interface file';
      }
    } else {
      context.deploySuccess = false;
      context.deployInfo = 'Service project already exists';
    }
  } else {
    context.deploySuccess = false;
    context.deployInfo = 'Service project is empty';
  }

  if (!context.deploySuccess) return;

  if (!Object.isEmpty(confs.path)) {
    var reqPath = confs.path.replace(/^\/*/, '').replace(/\/*$/, '');
    if (!isExistPath(reqPath)) {
      context.path = reqPath;
    } else {
      context.deploySuccess = false;
      context.deployInfo = 'Service path already exists';
    }
  } else {
    context.deploySuccess = false;
    context.deployInfo = 'Service path is empty';
  }

  if (!context.deploySuccess) return;

  var protocal = confs.protocal.toLowerCase();
  context.protocal = protocal === 'http' ? protocal : protocal === 'https' ? protocal : 'http';

  var port = parseInt(confs.port);
  port = port ? port : 80;
  context.port = port;

  var timeout = parseInt(confs.timeout);
  timeout = timeout ? timeout : 80;
  context.timeout = timeout;

}