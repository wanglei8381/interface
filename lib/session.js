var uid = require('uid-safe').sync;
var logger = require('./logger')('[session]');
var cookie = require('./cookie');

var KEY = 'IF_SID';

//保存session的容器
var sessions = Object.create(null);

var Session = module.exports = function Session() {
  this.id = uid(24);
  this.key = KEY;
  this.maxAge = 20 * 60 * 1000;
  this.expire = Date.now() + this.maxAge;
  sessions[this.id] = this;
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
    return null;
  }

};

Session.remove = function (sid) {
  if (sessions[sid]) {
    delete sessions[sid];
  }
};

Session.clear = function () {
  sessions = Object.create(null);
};