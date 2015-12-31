var uid = require('uid-safe').sync;
var logger = require('./logger')('[Interface][session]');
var sessionPool = require('./pool/session_pool');

var Session = module.exports = function Session() {
  //保存自定义的信息
  this.cache = {
    __proto__ : this
  };
  this.id = uid(24);
  this.key = sessionPool.key;
  this.maxAge = sessionPool.maxAge;
  this.update();
  //sessionPool.set(this);
};

Session.prototype.update = function () {
  this.expire = Date.now() + this.maxAge * 60 * 1000;
};

Session.get = function(sid, callback){
  return sessionPool.get(sid, callback);
};

Session.set = function(session){
  sessionPool.set(session);
};

Session.clear = function(){
  sessionPool.clear();
};

Session.key = sessionPool.key;

Session.pool = sessionPool;

Session.secret = sessionPool.secret;
