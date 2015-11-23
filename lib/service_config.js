var fs = require('fs');
var path = require('path');
var tools = require('./util/tools');
var logger = require('./logger')('[service_config]');

/**
 * 配置service上下文
 * @param context
 */
function parseConfig(context) {
  var server = context.parentContext;
  if (!Object.isEmpty(server.basedir)) {
    var servicePath = path.resolve(server.basedir, context.name);
    if (tools.isDir(servicePath)) {
      context.servicePath = servicePath;

      logger.debug('[parseConfig] servicePath: ' + servicePath);


    } else {
      throw new Error('服务找不到');
    }
  }
}

exports.parseConfig = parseConfig;