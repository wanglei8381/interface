var uid = require('uid-safe').sync;
var logger = require('./logger')('[Interface][session]');
var cookie = require('./cookie');

//cookie的name
var KEY = 'IF_SID';

//cookie签名信息
var DEFAULT_SECRET = 'DEF_INTERFACE_SECRET';

//默认session的存活时间，单位分钟
var DEFAULT_MAX_AGE = 20;

//保存session的容器
var sessions = Object.create(null);

//记录上次更新时间
var lastTime = Date.now();

var Session = module.exports = function Session(options) {
  options = options || {};
  //保存自定义的信息
  this.cache = {};
  this.id = uid(24);
  this.key = KEY;
  this.maxAge = options.maxAge || DEFAULT_MAX_AGE;
  this.update();
  sessions[this.id] = this;
};

Session.prototype.update = function () {
  this.expire = Date.now() + this.maxAge * 60 * 1000;
};

Session.get = function (sid) {

  var sess = sessions[sid];

  if (!sess) {
    logger.debug('[get]', 'no session');
    return null;
  }

  if (sess.expire > Date.now()) {
    return sess;
  } else {
    logger.debug('[get]', 'session timeout');
    delete sessions[sid];
    return null;
  }

};


Session.set = function (options) {
  options = options || {};
  DEFAULT_MAX_AGE = options.maxAge || DEFAULT_MAX_AGE;
  DEFAULT_SECRET = options.secret || DEFAULT_SECRET;
};

Session.remove = function (sid) {
  if (sessions[sid]) {
    delete sessions[sid];
  }
};

//清除无效的session
Session.clear = function () {
  //每隔一个小时清空一下数据
  if(Date.now() - lastTime < 1000 * 60 * 60) {
    return;
  }
  lastTime = Date.now();
  for (var key in sessions) {
    var sess = sessions[key];
    if (sess.expire <= Date.now()) {
      delete sessions[key];
    }
  }
};

Session.key = KEY;

Session.secret = DEFAULT_SECRET;

Session.store = sessions;