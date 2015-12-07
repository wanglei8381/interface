/**
 * 推荐使用的日志等级：
 *  ERROR、WARN、INFO、DEBUG
 *
 */

//默认的日志等级
var LEVEL_WEIGHT = 2;
var LEVELS = ['all', 'debug', 'info', 'warn', 'error', 'fatal', 'off'];
var LEVELS_UPPER = ['[ALL]', '[DEBUG]', '[INFO]', '[WARN]', '[ERROR]', '[FATAL]', '[OFF]'];
var LEVELS_SYS = ['log', 'info', 'warn', 'error'];

function Logger(name) {
  this.name = name || '';
}

/**
 * 设置日志等级
 * @param level:[1-7]
 * @returns {boolean}
 */
Logger.setLevel = function (level) {
  if (isNaN(level)) return false;
  Logger.clear();
  level = level < 1 ? 1 : level > 7 ? 7 : level;
  switch (level) {
    case 1 :
      Logger.prototype.all = log(1, 0);
    case 2 :
      Logger.prototype.debug = log(2, 0);
    case 3 :
      Logger.prototype.info = log(3, 1);
    case 4 :
      Logger.prototype.warn = log(4, 2);
    case 5 :
      Logger.prototype.error = log(5, 3);
    case 6 :
      Logger.prototype.fatal = log(6, 3);
    case 7 :
      Logger.prototype.off = log(7, 3);
  }
  return true;
};

//清空所有日志
Logger.clear = function () {
  LEVELS.forEach(function (level) {
    Logger.prototype[level] = function () {
    };
  });
};

function log(level, type) {
  return function () {
    var prefix = getPrefixInfo(level) + this.name;
    if (level <= 3) {
      console._stdout.write(prefix);
    } else {
      console._stderr.write(prefix);
    }
    console[LEVELS_SYS[type]].apply(console, arguments);
  };
}

function getPrefixInfo(level) {
  var d = new Date();
  var timestamp = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  var levelInfo = LEVELS_UPPER[level - 1];
  return this, levelInfo + ' ' + timestamp + ' ';
}

Logger.setLevel(LEVEL_WEIGHT);

exports = module.exports = function (name) {
  return new Logger(name);
};

exports.clear = Logger.clear;
exports.setLevel = Logger.setLevel;