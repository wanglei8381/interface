/**
 * 内部日志系统：
 *  ERROR、WARN、INFO、DEBUG
 *
 */

//默认的日志等级
var LEVEL_WEIGHT = 2;
var LEVELS = ['all', 'debug', 'info', 'warn', 'error', 'fatal', 'off'];
var LEVELS_UPPER = ['[ALL]', '[DEBUG]', '[INFO]', '[WARN]', '[ERROR]', '[FATAL]', '[OFF]'];

function Logger(name) {
  this.name = name || '';
}

//初始化日志等级
LEVELS.forEach(function (level) {
  Logger.prototype[level] = function () {};
});

/**
 * 设置日志等级
 * @param level:[1-7]
 * @returns {boolean}
 */
Logger.setLevel = function (level) {
  if (isNaN(level)) return false;
  LEVEL_WEIGHT = level < 1 ? 1 : level > 7 ? 7 : level;
  switch (LEVEL_WEIGHT) {
    case 1 :
      Logger.prototype.all = log1;
    case 2 :
      Logger.prototype.debug = log1;
    case 3 :
      Logger.prototype.info = log2;
    case 4 :
      Logger.prototype.warn = log3;
    case 5 :
      Logger.prototype.error = log4;
    case 6 :
      Logger.prototype.fatal = log4;
    case 7 :
      Logger.prototype.off = log4;
  }
};


function log1() {
  var paras = Array.prototype.splice.call(arguments,0);
  paras.unshift(console.log);
  print.apply(this,paras);
}

function log2() {
  var paras = Array.prototype.splice.call(arguments,0);
  paras.unshift(console.info);
  print.apply(this,paras);
}

function log3() {
  var paras = Array.prototype.splice.call(arguments,0);
  paras.unshift(console.warn);
  print.apply(this,paras);
}

function log4() {
  var paras = Array.prototype.splice.call(arguments,0);
  paras.unshift(console.error);
  print.apply(this,paras);
}

function print(callback) {
  console.log(arguments);
  var d = new Date();
  var timestamp = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  var levelInfo = LEVELS_UPPER[LEVEL_WEIGHT - 1];
  var paras = Array.prototype.splice.call(arguments, 1);
  paras.unshift(levelInfo + ' ' + timestamp + ' ' + this.name);
  callback.apply(this,paras);
}

exports = module.exports = Logger;


Logger.setLevel(1);
var logger = new Logger('[wanglei]');

logger.info('123');