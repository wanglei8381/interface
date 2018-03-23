var path = require('path')
var fs = require('fs')
var util = require('util')
var EventEmitter = require('events').EventEmitter
var RedisPool = require('./redis_pool')

var filePool = (module.exports = {
  // 缓存文件信息
  stack: {}
})

/**
 * 配置文件加载选项
 *
 * config.basePath
 *    预加载文件的基本目录
 * config.raw
 *    对加载的内容是否要处理成字符串,默认false,不处理
 * config.compress
 *    对加载的内容是否要压缩处理,默认false,不压缩
 * config.watcher
 *    监听文件变化,默认false,不监听
 * @param config
 */
filePool.config = function (config) {
  this.basePath = config.basePath
  this.raw = !!config.raw
  this.compress = !!config.compress
  this.watcher = !!config.watcher
}

/**
 * 开启redis缓存
 */
filePool.openRedisCache = function (config) {
  this.RP = new RedisPool(config)
}

/**
 * 发送文件流到redis服务器
 */
filePool.send = function () {
  var self = this
  var cache = {}
  if (this.RP) {
    for (var key in self.stack) {
      var fileman = self.stack[key]
      if (fileman.stream) {
        cache[key] = fileman.stream
        fileman.stream = null
        delete fileman.stream
      }
    }

    this.RP.acquire(function (client) {
      if (!client) return
      // client.EXISTS('FILE::CHACHE', function (err, data) {
      //
      // });
      client.HMSET('FILE::CHACHE', cache, function (err, data) {
        console.log('[send]redis相应的数据', 'err:' + err, 'data:' + data)
        client.release()
      })
    })
  }
}

/**
 * 定义缓存的文件
 * 读取文件的方式是同步阻塞读取，如果文件过大，可能会导致内存溢出和执行缓慢
 * @param options
 *    可以同时缓存多个文件
 *  option.name
 *    自定义的名字，可通过filePool.stack.name取出缓存的文件
 *    可省略，省略取文件的名称（没有后缀）
 *  option.path
 *    文件的路径，如果是绝对路径，直接获取，如果是相对于basePath的路径，拼接以后获取，
 *    不可省略
 *  option.raw
 *    对加载的内容是否要处理成字符串，如果不存在取filePool.raw的值
 *  option.compress
 *    对加载的内容是否要压缩处理,如果不存在取filePool.compress的值
 *    如果内容未处理成字符串，option.compress无效
 */
filePool.define = function (options) {
  var self = this
  if (!Array.isArray(options)) {
    options = [options]
  }

  options.forEach(function (option) {
    option.raw = option.raw == null ? self.raw : option.raw
    option.compress = option.compress == null ? self.compress : option.compress
    option.watcher = option.watcher == null ? self.watcher : option.watcher

    if (typeof option.path !== 'string') {
      throw TypeError('The file path name must be a string')
    }

    if (option.path.length === 0) {
      throw Error('The length of The file path name must be greater than 0')
    }

    if (option.name == null) {
      option.name = path.basename(option.path, path.extname(option.path))
    }

    if (self.stack[option.name]) {
      throw Error('The define_name already exists')
    }

    if (path.isAbsolute(option.path)) {
      option.path = path.resolve(option.path)
    } else {
      option.path = path.resolve(path.join(self.basePath, option.path))
    }

    if (fs.existsSync(option.path) && fs.statSync(option.path).isFile()) {
      var stream = null,
        selfWatcher = null

      function readFile () {
        var stream = fs.readFileSync(option.path)
        if (option.raw) {
          stream = stream.toString()
          if (option.compress) {
            stream = stream.replace(/[\r\n\t]+/g, '')
          }
        }
        return stream
      }

      if (option.watcher) {
        selfWatcher = new FileWatcher(option.path, function () {
          self.stack[option.name].stream = readFile()
          self.send()
        })
      }
      stream = readFile()
      self.stack[option.name] = {
        path: option.path,
        stream: stream,
        selfWatcher: selfWatcher
      }
    } else {
      throw Error('The ' + name + ' file does not exist')
    }
  })

  // 发送到redis
  this.send()
}

/**
 * 获取文件流
 * @param name
 *  定义名,可以使是个数组，一次获取多个
 */
filePool.get = function (name, callback) {
  if (typeof callback !== 'function') {
    callback = function () {}
  }
  if (this.RP) {
    this.RP.acquire(function (client) {
      if (!client) return callback()

      client.hget('FILE::CHACHE', name, callback)
    })
  } else {
    var stream = this.stack[name].stream
    callback(null, stream)
    return stream
  }
}

/**
 * 检测文件的变化
 * @param realpath
 * @returns {FileWatcher}
 * @constructor
 */
function FileWatcher (realpath, callback) {
  if (this instanceof FileWatcher) {
    var self = this
    EventEmitter.call(self)

    function buildWatcher () {
      self.watcher = fs.watch(realpath, function (event, fn) {
        if (event == 'change') {
          self.emit('CLOSE', {})
          self.emit('CHANGE', {})
        }
      })
    }

    self.on('CHANGE', function () {
      buildWatcher()
      callback()
    })

    self.on('CLOSE', function () {
      self.watcher.close()
      self.watcher = null
    })

    buildWatcher()
    return self
  }
  return new FileWatcher(realpath)
}

util.inherits(FileWatcher, EventEmitter)

filePool.FileWatcher = FileWatcher
