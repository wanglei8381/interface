/**
 * 借鉴express
 */

var http = require('http')
var send = require('send')
var mixin = require('./util/tools').mixin
var mime = send.mime
var sign = require('cookie-signature').sign
var cookie = require('./cookie')
var Session = require('./session')

var res = (module.exports = {
  __proto__: http.ServerResponse.prototype
})

res.endFunction = res.end

res.end = function (data, encoding, callback) {
  // 设置，更新session
  if (this.req.session) {
    Session.set(this.req.session.__proto__)
  }
  this.endFunction(data, encoding, callback)
}

res.json = function (obj) {
  this.statusCode = 200
  this.setHeader('Content-Type', 'application/json;charset=utf-8')
  this.setHeader('X-Powered-By', 'Interface')
  this.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS,PUT,DELETE')
  this.setHeader('Access-Control-Allow-Origin', '*')
  this.end(JSON.stringify(obj))
}

res.fail = function (obj) {
  if (obj == null) {
    obj = 'fail'
  }
  this.json({ status: -1, msg: obj })
}

res.ok = function (obj) {
  if (obj == null) {
    obj = 'ok'
  }
  this.json({ status: 1, msg: obj })
}

res.set = res.header = function header (field, val) {
  if (arguments.length === 2) {
    if (Array.isArray(val)) val = val.map(String)
    else val = String(val)
    if (field.toLowerCase() == 'content-type' && !/;\s*charset\s*=/.test(val)) {
      var charset = mime.charsets.lookup(val.split(';')[0])
      if (charset) val += '; charset=' + charset.toLowerCase()
    }
    this.setHeader(field, val)
  } else {
    for (var key in field) {
      this.set(key, field[key])
    }
  }
  return this
}

res.get = function (field) {
  return this.getHeader(field)
}

res.clearCookie = function (name, options) {
  var opts = { expires: new Date(1), path: '/' }
  return this.cookie(name, '', options ? mixin(opts, options) : opts)
}

/**
 *
 * Options:
 *
 *    - `maxAge`   max-age in seconds, converted to `expires`
 *    - `signed`   sign the cookie
 *    - `path`     defaults to "/"
 *
 * @param name
 * @param val
 * @param options
 * @returns {exports}
 */
res.cookie = function (name, val, options) {
  options = mixin({}, options)
  var secret = this.req.secret
  if (Object.isEmpty(secret) && name === Session.key) {
    secret = Session.secret
  }
  var signed = options.signed
  if (signed && !secret) { throw new Error('cookieParser("secret") required for signed cookies') }
  if (typeof val === 'number') val = val.toString()
  if (typeof val === 'object') val = JSON.stringify(val)
  if (signed && secret != null) val = 's:' + sign(val, secret)
  if ('maxAge' in options) {
    options.maxAge = options.maxAge * 60
    options.expires = new Date(Date.now() + options.maxAge * 1000)
  }
  if (options.path == null) options.path = '/'
  var headerVal = cookie.serialize(name, String(val), options)

  // supports multiple 'res.cookie' calls by getting previous value
  var prev = this.get('Set-Cookie')
  if (prev) {
    if (Array.isArray(prev)) {
      headerVal = prev.concat(headerVal)
    } else {
      headerVal = [prev, headerVal]
    }
  }
  this.set('Set-Cookie', headerVal)
  return this
}
