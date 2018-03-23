/**
 * 推荐使用的日志等级：
 *  ERROR、WARN、INFO、DEBUG
 */

// 日志等级
let levelWeight = 2
const LEVELS = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF']

class Logger {
  constructor (name) {
    this.name = name
  }

  static setLevel (level) {
    if (typeof level === 'string') {
      levelWeight = LEVELS.indexOf(level.toUpperCase()) + 1
    } else {
      levelWeight = level
    }
  }

  static clear () {
    this.setLevel(0)
  }
}

Logger.prototype.all = print(1)
Logger.prototype.debug = print(2)
Logger.prototype.info = print(3)
Logger.prototype.warn = print(4)
Logger.prototype.error = print(5)
Logger.prototype.fatal = print(6)
Logger.prototype.off = print(7)

function print (level) {
  return function (...args) {
    if (levelWeight >= level && level > 0 && level < 8) {
      let out = '[' + getTimestamp() + '][' + LEVELS[level - 1] + ']'
      if (this.name) {
        out += '[' + this.name + ']'
      }
      if (level < 4) {
        process.stdout.write(out)
        console.log(...args)
      } else {
        process.stderr.write(out)
        console.error(...args)
      }
    }
  }
}

function getTimestamp () {
  let d = new Date()
  return (
    d.getFullYear() +
    '-' +
    add0lt10(d.getMonth() + 1) +
    '-' +
    add0lt10(d.getDate()) +
    ' ' +
    add0lt10(d.getHours()) +
    ':' +
    add0lt10(d.getMinutes()) +
    ':' +
    add0lt10(d.getSeconds())
  )
}

function add0lt10 (num) {
  return num < 10 ? '0' + num : num
}

module.exports = function (name) {
  return new Logger(name)
}

module.exports.Logger = Logger
