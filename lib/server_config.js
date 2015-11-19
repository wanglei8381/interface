var fs = require('fs');
var path = require('path');
var parseJSON = require('./util/parseJSON');
var tools = require('./util/tools');
var Logger = require('./logger');
var logger = Logger('[server_config]');
/**
 * 配置server上下文
 * @param context
 */
function parseConfig(context) {
  handleTemplateService(context);
  handleUserService(context);
  //设置日志等级
  if (context.log.level) {
    Logger.setLevel(context.log.level);
  }
  logger.debug('[parseConfig] service.json加载完成');
}

/**
 * 处理模板service
 * @param context
 */
function handleTemplateService(context) {
  var result = parseJSON(fs.readFileSync(path.resolve(__dirname, '../conf/service.json')).toString(), '解析模板service.json出错了');
  var server = result.server;
  for (var key in server) {
    context[key] = server[key];
  }
};

/**
 * 处理用户service
 * @param context
 */
function handleUserService(context) {
  var result = parseJSON(fs.readFileSync(path.join(context.workpath, 'service.json')).toString(), '解析service.json出错了');
  var server = result.server;
  tools.replace(context, server, true);
};
