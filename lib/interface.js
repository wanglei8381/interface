var fs = require('fs');
var path = require('path');
var parseJSON = require('./util/parseJSON');
exports.main = function (dir) {
  try {
    var service = parseJSON(fs.readFileSync(path.join(dir, 'service.json')).toString(),'解析service.json出错了');
  } catch (e) {
    console.error('[interface][main]', e.stack);
  }
};