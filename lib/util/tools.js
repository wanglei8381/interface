var fs = require('fs');
var isPlainObject = Object.isPlainObject;
var isArray = Array.isArray;
/**
 * 将source对象上的属性扩展到target，非空替换
 * @param target
 * @param source
 * @param deep
 * @returns {*}
 */
function extend(target, source, deep) {
  if (arguments.length == 2) {
    deep = source;
    source = target;
    target = {};
  }
  var key = null;
  for (key in source) {
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
        target[key] = {};
      }
      if (isArray(source[key]) && !isArray(target[key])) {
        target[key] = [];
      }
      extend(target[key], source[key], deep);
    } else if (source[key] != null) {
      target[key] = source[key];
    } else if (!target.hasOwnProperty(key)) {
      target[key] = null;
    }
  }
  return target;
}

/**
 * 将target上的属性和source上的同名属性，非空替换
 * @param target
 * @param source
 * @param deep
 * @returns {*}
 */
function replace(target, source, deep) {
  if (arguments.length == 2) {
    deep = source;
    source = target;
    target = {};
  }
  var key = null;
  for (key in source) {
    if (target.hasOwnProperty(key)) {
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(target[key]) && !isPlainObject(source[key])) {
          continue;
        }
        if (isArray(target[key]) && !isArray(source[key])) {
          continue;
        }
        replace(target[key], source[key], deep);
      } else if (source[key] != null) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

function mixin(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}

//文件或目录是否存在
function exists(path) {
  return fs.existsSync(path);
}

//是否是文件
function isFile(path) {
  return exists(path) && fs.statSync(path).isFile();
}

//是否是目录
function isDir(path) {
  return exists(path) && fs.statSync(path).isDirectory();
}

exports.extend = extend;
exports.mixin = mixin;
exports.replace = replace;
exports.isFile = isFile;
exports.isDir = isDir;