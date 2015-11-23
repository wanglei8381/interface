var fs = require('fs');
var path = require('path');
var Service = require('./service');
var parseJSON = require('./util/parseJSON');
var tools = require('./util/tools');
var Logger = require('./logger');
var logger = Logger('[server_config]');
var serviceConfig = require('./service_config');
/**
 * 配置server上下文
 * @param context
 */
function parseConfig(context) {
  handleServerConfig(context);
  //设置日志等级
  if (context.log.level != null) {
    Logger.setLevel(context.log.level);
  }
  logger.debug('[parseConfig] service.json加载完成');


}

/**
 * 处理server配置
 * @param context
 */
function handleServerConfig(context) {
  var result1 = parseJSON(fs.readFileSync(path.resolve(__dirname, '../conf/service.json')).toString(), '解析模板service.json出错了');
  var result2 = parseJSON(fs.readFileSync(path.join(context.workpath, 'service.json')).toString(), '解析service.json出错了');
  var templateServer = result1.server;
  var applicationServer = result2.server;
  var templateService = templateServer.service;
  var services = applicationServer.services;
  delete templateServer.service;
  delete applicationServer.services;
  tools.extend(context,tools.replace(templateServer, applicationServer, true),false);
  //存储服务
  context.services = {};

  services.forEach(function(item){
    var service = new Service(templateService,item);
    context.services[service.name] = service;
    service.parentContext = context;
    serviceConfig.parseConfig(service);
  });

}

exports.parseConfig = parseConfig;