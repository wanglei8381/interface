/**
 * 借鉴express
 */

var http = require('http');

var res = module.exports = {
  __proto__: http.ServerResponse.prototype
};

res.json = function (obj) {
  this.statusCode = 200;
  this.setHeader("Content-Type", "application/json;charset=utf-8");
  this.setHeader('X-Powered-By', 'Interface');
  this.setHeader("access-control-allow-methods", "GET,POST,OPTIONS,PUT,DELETE");
  this.setHeader("Access-Control-Allow-Origin", "*");
  this.end(JSON.stringify(obj));
}

res.fail = function (obj) {
  if(obj == null) {
    obj = 'fail';
  }
  this.json({status: -1, msg: obj});
}

res.ok = function (obj) {
  if(obj == null) {
    obj = 'ok';
  }
  this.json({status: 1, msg: obj});
}