var uid = require('uid-safe').sync;
var logger = require('./logger')('[session]');
var cookie = require('./cookie');

//cookie的name
var KEY = 'IF_SID';

//cookie签名信息
var DEFAULT_SECRET = 'DEF_INTERFACE_SECRET';

//默认session的存活时间，单位分钟
var DEFAULT_MAX_AGE = 20;

//保存session的容器
var sessions = Object.create(null);

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
    logger.debug('get', 'no session');
    return null;
  }

  if (sess.expire > Date.now()) {
    return sess;
  } else {
    logger.debug('get', 'session timeout');
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

Session.clear = function () {
  sessions = Object.create(null);
};

Session.key = KEY;

Session.secret = DEFAULT_SECRET;

Session.store = sessions;