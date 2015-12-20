var path = require('path');
var filter = require('./filter');
var tools = require('./util/tools');
var fs = require('fs');
var parseJSON = require('./util/parseJSON');
var logger = require('./logger')('[service]');
var request = require('./request');
var response = require('./response');
var METHODS = require('http').METHODS;

var identifierReg = /^[a-zA-Z_]+[a-zA-Z_1-9]*$/;

var service = module.exports = function (manager, confs) {
  this.deploySuccess = true;
  this.confs = confs;
  //接口配置
  this.confs.i_fs = [];
  //过滤器配置
  this.confs.filters = [];
  //接口
  this.i_fs = [];
  //过滤器
  this.filters = [];
  try {
    parseConfig(manager, this);
  } catch (e) {
    this.deploySuccess = false;
    logger.error('[constructor]', 'Parsing configuration file', e.stack);
  }

  try {
    if (this.deploySuccess) {
      handleInterfaceConfig(this);
    }
  } catch (e) {
    logger.error('[constructor]', 'handle interface config', e.stack);
  }

  try {
    if (this.deploySuccess) {
      bindingInterface(this);
    }
  } catch (e) {
    logger.error('[constructor]', 'binding interface', e.stack);
  }

  try {
    if (this.deploySuccess) {
      bindingFilter(this);
    }
  } catch (e) {
    logger.error('[constructor]', 'binding filter', e.stack);
  }

};

service.prototype.handle = function (req, res) {
  req.secret = 'app';
  req.res = res;
  res.req = req;
  req.__proto__ = request;
  res.__proto__ = response;
  req.context = res.context = this;

  req.handleReqURL();
  this.adapter(req, res);
};

service.prototype.adapter = function (req, res) {

  logger.info('[adapter][url]', req.url);

  if (!this.checkApp(req)) {
    return res.fail('The service does not exist');
  }

  var i_f = this.matchInterface(req);

  if (i_f) {
    if (i_f.pass || i_f.methods.indexOf(req.method) > -1) {
      i_f.handle(req, res);
    } else {
      res.fail('The ' + req.method.toLowerCase() + ' request does not support');
    }

  } else {
    res.fail('The i_f does not exist');
  }

};

service.prototype.matchInterface = function (req) {

  var _this = this;
  var i_f = null;
  this.i_fs.each(function (item) {
    var path = _this.path + item.path;
    if (item.deploySuccess && path === req.pathname) {
      i_f = item;
      return true;
    }
  });

  return i_f;
};

service.prototype.checkApp = function (req) {
  return this.path === req.baseUrl;
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
    var reqPath = '/' + confs.path.replace(/^\/*/, '').replace(/\/*$/, '');
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

function handleInterfaceConfig(context) {
  var result1 = result2 = null;
  try {
    result1 = fs.readFileSync(path.resolve(__dirname, '../conf/interface.json')).toString();
  } catch (e) {
    logger.fatal('[init]', 'Failed to read the configuration interface.json file');
    throw e;
  }

  try {
    result2 = fs.readFileSync(context.project_interface).toString();
  } catch (e) {
    logger.fatal('[init]', 'Failed to read the user interface.json file');
    throw e;
  }

  result1 = parseJSON(result1, 'Parsing configuration interface.json file failed');
  result2 = parseJSON(result2, 'Parsing user interface.json file failed');

  var i_f = result1.interface;
  var i_fs = result2.interfaces;

  var filter = result1.filter;
  var filters = result2.filters;

  if (Object.isEmpty(i_fs)) return;

  if (!Array.isArray(i_fs)) {
    i_fs = [i_fs];
  }

  context.confs.i_fs = i_fs.map(function (item) {
    return tools.replace(tools.extend(i_f, false), item, false);
  });

  if (!Object.isEmpty(filters)) {
    if (!Array.isArray(filters)) {
      filters = [filters];
    }

    context.confs.filters = filters.map(function (item) {
      return tools.replace(tools.extend(filter, false), item, false);
    });

  }
}

function bindingInterface(context) {
  context.confs.i_fs.forEach(function (item, index) {
    var i_f = new Interface(item, context);
    i_f.parentContext = context;
    context.i_fs[index] = i_f;
  });
}

function Interface(confs, manager) {
  this.confs = confs;
  this.deploySuccess = true;
  var name = path.resolve(path.join(manager.project, confs.name));

  if (tools.isDir(name)) {
    name = path.join(name, 'if.js');
  }
  if (tools.isFile(name)) {
    this.name = name;
    var fn = require(name).Runner;
    if (Object.isFunction(fn)) {
      this.handle = fn;
    } else {
      this.deploySuccess = false;
    }
  } else {
    this.deploySuccess = false;
  }

  if (!this.deploySuccess) return;

  if (!Object.isEmpty(confs.path)) {
    this.path = confs.path;
  } else {
    this.deploySuccess = false;
  }

  if (!this.deploySuccess) return;

  var methods = [];
  confs.method.split(',').forEach(function (method) {
    method = method.toUpperCase();
    if (METHODS.indexOf(method) > -1) {
      methods.push(method);
    }
  });

  if (Object.isEmpty(methods)) {
    methods = ['ALL'];
  }

  if (methods.indexOf('ALL') > -1) {
    this.pass = true;
  } else {
    this.pass = false;
  }
  this.methods = methods;
  this.public = !!confs.public;
}

function bindingFilter(context) {
  if (!Object.isEmpty(context.confs.filters)) {
    context.filters = context.confs.filters.map(function (item) {
      return filter(context, item);
    });
  }
  console.log('############',context.filters);
}