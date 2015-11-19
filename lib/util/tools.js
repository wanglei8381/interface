var isPlainObject = Object.isPlainObject;
var isArray = Array.isArray;
/**
 * 将source对象上的属性扩展到target，非空替换
 * @param target
 * @param source
 * @param deep
 * @returns {*}
 */
var extend = function (target, source, deep) {
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
    }
  }
  return target;
};

/**
 * 将target上的属性和source上的同名属性，非空替换
 * @param target
 * @param source
 * @param deep
 * @returns {*}
 */
function replace(target, source, deep) {
  var key = null;
  if (target == null) {
    target = {};
  }
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
};

exports.extend = extend;
exports.replace = replace;