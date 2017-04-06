var path = require('path');
var Filter = require('./filter');
var Router = require('./router');
var tools = require('./util/tools');
var fs = require('fs');
var parseJSON = require('./util/parseJSON');
var logger = require('./logger')('[Interface][service]');
var request = require('./request');
var response = require('./response');
var form = require('./form');
var sessionPool = require('./pool/session_pool');

var identifierReg = /^[a-zA-Z_]+[a-zA-Z_1-9]*$/;

var service = module.exports = function (manager, confs) {
  this.deploySuccess = true;
  this.confs = confs;
  //接口配置
  this.confs.i_fs = [];
  //过滤器配置
  this.confs.filters = [];

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
      bindingFilter(this);
    }
  } catch (e) {
    logger.error('[constructor]', 'binding filter', e.stack);
  }

  try {
    if (this.deploySuccess) {
      bindingInterface(this);
    }
  } catch (e) {
    logger.error('[constructor]', 'binding interface', e.stack);
  }

  sessionPool.setConfig(manager.session);
};

service.prototype.handle = function (req, res) {
  req.res = res;
  res.req = req;
  req.__proto__ = request;
  res.__proto__ = response;
  req.context = res.context = this;

  req.handleReqURL();
  this.adapter(req, res);
};

service.prototype.adapter = function (req, res) {

  logger.info('[adapter] [url]', req.url);

  var _this = this;

  if (!this.checkApp(req)) {
    logger.warn('[adapter] [url]', 'The service does not exist');
    return res.fail('The service does not exist');
  }

  //执行过滤器
  this.filter.handle(req, res, function () {
    //执行接口函数
    _this.router.handle(req, res);
  });

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

  var router = new Router(context);

  context.confs.i_fs.forEach(function (confs) {
    router.handleConfig(context, confs);
    logger.debug('[bindingInterface]' + confs.name);
  });
}

function bindingFilter(context) {

  //初始化过滤器
  var filter = new Filter(context);

  //处理系统过滤器
  filter.use(context.path + '/**', function (req, res, next) {
    req.handleCookie(next);
  }, function (req, res, next) {
    req.handleSession(next);
  }, form.json(), form.urlencoded(), form.multipart());

  //处理用户自定义过滤器
  if (!Object.isEmpty(context.confs.filters)) {
    context.confs.filters.forEach(function (confs) {
      filter.handleConfig(context, confs);
      logger.debug('[bindingFilter]' + confs.target);
    });
  }

}