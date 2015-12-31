/**
 * 借鉴express
 */

var http = require('http');
var url = require('url');
var cookie = require("./cookie");
var Session = require("./session");

var req = exports = module.exports = {
  __proto__: http.IncomingMessage.prototype
};

req.get =
  req.header = function (name) {
    switch (name = name.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return this.headers.referrer
          || this.headers.referer;
      default:
        return this.headers[name];
    }
  };

req.hasBody = function () {
  var encoding = 'transfer-encoding' in this.headers;
  var length = 'content-length' in this.headers && this.headers['content-length'] !== '0';
  return encoding || length;
}

req.mime = function () {
  var str = this.get('content-type') || '';
  return str.split(';')[0];
};

defineGetter(req, 'xhr', function xhr() {
  var val = this.get('X-Requested-With') || '';
  return 'xmlhttprequest' === val.toLowerCase();
});

defineGetter(req, 'secure', function secure() {
  return 'https' == this.context.protocal;
});

function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: getter
  });
};

req.param = function (name, defaultValue) {
  var params = this.params || {};
  var body = this.body || {};
  var query = this.query || {};
  if (null != params[name] && params.hasOwnProperty(name)) return params[name];
  if (null != body[name]) return body[name];
  if (null != query[name]) return query[name];
  return defaultValue;
};

req.handleReqURL = function () {
  this.originalUrl = this.get('referer') || this.url;
  var urlObj = url.parse(this.originalUrl, true);
  this.protocol = urlObj.protocol;
  this.hostname = urlObj.hostname || this.get('X-Forwarded-Host') || this.get('Host');
  this.pathname = urlObj.pathname;
  this.query = urlObj.query;
  this.body = {};
  this.files = {};

  var index = this.url.indexOf('/', 1);
  index = index === -1 ? this.url.length : index;
  var baseUrl = this.url.substring(0, index);
  this.baseUrl = baseUrl;

  this.secret = this.secret || Session.secret;
};

req.handleCookie = function () {
  this.cookies = {};
  if (this.headers.cookie) {
    this.cookies = cookie.parse(this.headers.cookie, {secret: this.secret});
  }
};

req.handleSession = function () {

  //清除无效的session
  Session.clear();

  var session = {};
  var sid = this.cookies[Session.key];
  if (sid) {
    session = Session.get(sid);
    if (session != null) {
      session.update();
    } else {
      session = new Session();
    }
  } else {
    session = new Session();
  }
  this.res.cookie(Session.key, session.id, {maxAge: session.maxAge, signed: true});
  req.session = session.cache;

};