/**
 * 借鉴express
 */

var http = require('http');

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

defineGetter(req, 'xhr', function xhr(){
  var val = this.get('X-Requested-With') || '';
  return 'xmlhttprequest' === val.toLowerCase();
});

function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: getter
  });
};


req.handleInterface = function(){
  this.originalUrl = this.originalUrl || this.url;
  this.baseUrl = '/';

  var index = this.url.indexOf('/', 1);
  index = index === -1 ? this.url.length : index;
  var baseUrl = this.url.substring(0, index);
  this.baseUrl = baseUrl;

};