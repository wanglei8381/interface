var fs = require('fs');
var path = require('path');
var parseJSON = require('./util/parseJSON');

/**
 * 配置server上下文
 * @param context
 */
function parseConfig(context) {

  var result = parseJSON(fs.readFileSync(path.join(dir, 'service.json')).toString(), '解析service.json出错了');
  context.name = result.server.name;
  context.cluster = result.server.cluster;
  context.basedir = result.server.basedir;
}