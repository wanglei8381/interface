var ObjectProto = Object.prototype
var toString = ObjectProto.toString
// 数组最大的下标
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1

/**
 * 是否是对象
 */
Object.isObject = function (obj) {
  var type = typeof obj
  return type === 'function' || (type === 'object' && !!obj)
}

/**
 * 是否是朴素对象
 */
Object.isPlainObject = function (obj) {
  return Object.isObject(obj) && Object.getPrototypeOf(obj) == ObjectProto
}

/**
 * 添加类型判断，分别是：参数，函数，字符串，数字，日期，正则表达式，错误，布尔，数组
 */
;[
  'Arguments',
  'Function',
  'String',
  'Number',
  'Date',
  'RegExp',
  'Error',
  'Boolean',
  'Array'
].forEach(function (name) {
  Object['is' + name] = function (obj) {
    return toString.call(obj) === '[object ' + name + ']'
  }
})

/**
 * 是否是类数组（字符串，arguments）
 */
Object.isArrayLike = function (collection) {
  var length = collection.length
  return typeof length === 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
}

/**
 * 对象是否为空
 * 数组，类数组，字符串或对象
 * @param obj
 * @returns {boolean}
 */
Object.isEmpty = function (obj) {
  if (obj == null) return true
  if (
    Object.isArrayLike(obj) &&
    (Object.isArray(obj) || Object.isString(obj) || Object.isArguments(obj))
  ) { return obj.length === 0 }
  if (Object.isObject(obj)) return Object.keys(obj).length === 0
  return false
}

// 检索obj拥有的和继承的所有属性的名称。
Object.allKeys = function (obj) {
  var keys = []
  if (!Object.isObject(obj)) {
    return keys
  }
  for (var key in obj) {
    keys.push(key)
  }

  return keys
}
