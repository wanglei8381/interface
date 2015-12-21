var pathToRegExp = require('./pathToRegExp');
var tools = require('../util/tools');
var path = require('path');
var logger = require('../logger')('[filter]');

var Filter = module.exports = function (context) {

  var filter = {};
  filter.__proto__ = Filter;
  filter.stack = [];
  filter.context = context;
  context.filter = filter;
  return filter;

};

Filter.handleConfig = function (context, confs) {
  var filter = {
    deploySuccess: true,
    mapping: [],
    excludeMapping: [],
    target: []
  };

  //映射路径
  var mapping = confs.mapping;
  //排除的路径
  var excludeMapping = confs['exclude-mapping'];
  //目标执行文件
  var target = confs.target;

  if (Object.isEmpty(mapping) || Object.isEmpty(target)) {
    filter.deploySuccess = false;
    return filter;
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
        filter.target.push(fn);
      }
    }
  });

  if (Object.isEmpty(filter.target)) {
    filter.deploySuccess = false;
    return filter;
  }

  filter.mapping = mapping.map(function (item) {
    return pathToRegExp(context.path + item);
  });

  if (!Object.isEmpty(excludeMapping)) {
    filter.excludeMapping = excludeMapping.map(function (item) {
      return pathToRegExp(context.path + item);
    });
  }

  this.stack.push(filter);
}

Filter.use = function (fn) {

  var filter = {
    deploySuccess: true,
    mapping: [this.context.path + '/**'],
    excludeMapping: [],
    target: []
  };

  var target = [];
  var offset = 0;
  if (typeof fn === 'string') {
    filter.mapping = [fn];
    offset = 1;
  }

  target = Array.prototype.slice.call(arguments, offset);

  if (target.length === 0) {
    logger.warn('[use] Filter.use() requires middleware functions');
    filter.deploySuccess = false;
    return filter;
  }

  target.forEach(function (item) {
    if (Object.isFunction(item)) {
      filter.target.push(item);
    }
  });

  if (filter.target.length === 0) {
    logger.warn('[use] Filter.use() requires middleware functions');
    filter.deploySuccess = false;
    return filter;
  }

  filter.mapping = filter.mapping.map(function (item) {
    return pathToRegExp(item);
  });

  this.stack.push(filter);
  return filter;
};

Filter.handle = function (req, res, done) {
  logger.debug('[handle] enter into filter');
  var statck = this.stack;
  if (statck.length === 0) return;
  var index = 0;
  var targets = this.match(statck, req.pathname);
  if (targets.length === 0) {
    done();
    return;
  }

  function next(err) {
    if (err) {
      if (typeof err === 'string') {
        err = new Error(err);
      }
      res.fail(err.message);
      logger.error('handle next', err.stack);
      return;
    }
    var target = targets[index++];
    if (!target) {
      return done();
    }

    target(req, res, next);
  }

  next();
};

Filter.match = function (statck, pathname) {

  var targets = [];

  statck.forEach(function (filter) {
    if (filter.deploySuccess) {
      var pass = false;
      filter.mapping.each(function (item) {
        return pass = item.test(pathname);
      });
      if (pass) {
        if (!Object.isEmpty(filter.excludeMapping)) {
          filter.excludeMapping.each(function (item) {
            return pass = item.test(pathname);
          });

          if (!pass) {
            targets = targets.concat(filter.target);
          }
        } else {
          targets = targets.concat(filter.target);
        }
      }
    }
  });

  return targets;
};
