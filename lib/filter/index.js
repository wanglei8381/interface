var pathToRegExp = require('./pathToRegExp');
var tools = require('../util/tools');
var path = require('path');

module.exports = function (context, confs) {
  return new Filter(context, confs);
};


function Filter(context, confs) {

  this.deploySuccess = true;
  this.mapping = [];
  this.excludeMapping = [];
  this.target = [];
  var _this = this;

  //映射路径
  var mapping = confs.mapping;
  //排除的路径
  var excludeMapping = confs['exclude-mapping'];
  //目标执行文件
  var target = confs.target;

  if (Object.isEmpty(mapping) || Object.isEmpty(target)) {
    this.deploySuccess = false;
    return this;
  }

  if (!Array.isArray(mapping)) {
    mapping = [mapping];
  }

  if (!Object.isEmpty(excludeMapping) && !Array.isArray(excludeMapping)) {
    excludeMapping = [excludeMapping];
  }

  if (!Array.isArray(target)) {
    target = [target];
  }

  target.forEach(function (item) {
    item = path.resolve(path.join(context.project, item));

    if (tools.isDir(item)) {
      item = path.join(item, 'filter.js');
    }
    if (tools.isFile(item)) {

      var fn = require(item).Runner;
      if (Object.isFunction(fn)) {
        _this.target.push(fn);
      }
    }
  });

  if (Object.isEmpty(this.target)) {
    this.deploySuccess = false;
    return this;
  }

  this.mapping = mapping.map(function (item) {
    return pathToRegExp(item);
  });

  if (!Object.isEmpty(excludeMapping)) {
    this.excludeMapping = excludeMapping.map(function (item) {
      return pathToRegExp(item);
    });
  }

}
