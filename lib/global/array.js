/**
 * 扩展数组的方法
 */

var ArrayProto = Array.prototype
/**
 * 在Object原型上添加属性
 * @param name 属性名
 * @param value 值
 */
var definePropertyHandler = function (name, value) {
  Object.defineProperty(ArrayProto, name, { value: value, enumerable: false })
}

/**********************
 * 数组的操作
 *********************/

/**
 * 转化为数组
 */
if (Array.toArray === undefined) {
  Array.toArray = function (arr) {
    return ArrayProto.slice.call(arr)
  }
}

/**
 * last获取数组最后一个元素,不删除
 */
definePropertyHandler('last', function () {
  return this[this.length - 1]
})

/**
 * 数组是否为空
 */
definePropertyHandler('isEmpty', function () {
  return this.length === 0
})

/**
 * 功能类似于push,不同之处在于，重复的数据将覆盖旧的数据
 */
definePropertyHandler('add', function () {
  var _this = this,
    length = arguments.length

  var _add = function (item) {
    var index = _this.indexOf(item)
    if (index === -1) {
      _this[_this.length] = item
    } else {
      _this[index] = item
    }
  }

  if (length === 1) {
    _add(arguments[0])
  } else if (length > 1) {
    Array.toArray(arguments).forEach(function (item) {
      _add(item)
    })
  }
  return this.length
})

/**
 * 删除指定下标的的元素，并返回这个元素
 */
definePropertyHandler('remove', function (i) {
  return this.splice(i, 1)[0]
})

/**********************
 * 数组的遍历
 *********************/

/**
 * 数组遍历
 * @param callback回调函数，传入三个参数分别是：值，下表，该数组
 * 当callback返回true时停止遍历
 */
definePropertyHandler('each', function (callback) {
  var i = 0,
    length = this.length
  var stop = false
  for (; i < length; i++) {
    stop = callback(this[i], i, this)
    if (stop === true) {
      break
    }
  }
})

definePropertyHandler('contains', function (item) {
  if (this.indexOf(item) !== -1) return true
  return false
})
