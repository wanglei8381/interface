var fs = require('fs');
var path = require('path');
var tools = require('./util/tools');
var logger = require('./logger')('[service_config]');
var parseJSON = require('./util/parseJSON');

/**
 * 配置service上下文
 * 如果根目录存在从根目录查找，否则从工作目录查找
 * @param context
 */
function parseConfig(context) {
  var server = context.parentContext;
  var servicePath = null;
  if (!Object.isEmpty(server.basedir)) {
    servicePath = path.resolve(server.basedir, context.name);
  } else {
    servicePath = path.resolve(server.workpath, context.name);
  }

  if (tools.isDir(servicePath)) {
    context.servicePath = servicePath;
    logger.debug('[parseConfig] servicePath: ' + servicePath);
    handleServiceConfig(context);
  } else {
    context.deploySuccess = false;
  }
}

/**
 * 处理模板interface
 * @param context
 */
function handleServiceConfig(context) {
  var result1 = parseJSON(fs.readFileSync(path.resolve(__dirname, '../conf/interface.json')).toString(), '解析模板interface.json出错了');
  var result2 = parseJSON(fs.readFileSync(path.resolve(context.servicePath, 'interface.json')).toString(), '解析interface.json出错了');
  var interfaces = result2.interfaces;

  if (Array.isArray(interfaces)) {
    context.interfaces = interfaces.map(function (item) {
      return tools.replace(tools.extend(result1, false), item, false);
    });
  }
}


exports.parseConfig = parseConfig;