/**
 * 借鉴express
 */

var http = require('http')
var url = require('url')
var cookie = require('./cookie')
var Session = require('./session')

var req = (exports = module.exports = {
  __proto__: http.IncomingMessage.prototype
})

req.get = req.header = function (name) {
  switch ((name = name.toLowerCase())) {
    case 'referer':
    case 'referrer':
      return this.headers.referrer || this.headers.referer
    default:
      return this.headers[name]
  }
}

req.hasBody = function () {
  var encoding = 'transfer-encoding' in this.headers
  var length =
    'content-length' in this.headers && this.headers['content-length'] !== '0'
  return encoding || length
}

req.mime = function () {
  var str = this.get('content-type') || ''
  return str.split(';')[0]
}

defineGetter(req, 'xhr', function xhr () {
  var val = this.get('X-Requested-With') || ''
  return val.toLowerCase() === 'xmlhttprequest'
})

defineGetter(req, 'secure', function secure () {
  return this.context.protocal == 'https'
})

function defineGetter (obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: getter
  })
}

req.param = function (name, defaultValue) {
  var params = this.params || {}
  var body = this.body || {}
  var query = this.query || {}
  if (params[name] != null && params.hasOwnProperty(name)) return params[name]
  if (body[name] != null) return body[name]
  if (query[name] != null) return query[name]
  return defaultValue
}

req.handleReqURL = function () {
  this.originalUrl = this.get('referer') || this.url
  var urlObj = url.parse(this.originalUrl, true)
  this.protocol = urlObj.protocol
  this.hostname =
    urlObj.hostname || this.get('X-Forwarded-Host') || this.get('Host')
  this.pathname = urlObj.pathname
  this.query = urlObj.query
  this.body = {}
  this.files = {}

  var index = this.url.indexOf('/', 1)
  index = index === -1 ? this.url.length : index
  var baseUrl = this.url.substring(0, index)
  this.baseUrl = baseUrl

  this.secret = this.secret || Session.secret
}

req.handleCookie = function (next) {
  this.cookies = {}
  if (this.headers.cookie) {
    this.cookies = cookie.parse(this.headers.cookie, { secret: this.secret })
  }
  next()
}

req.handleSession = function (next) {
  var self = this
  var session = {}
  var done = function () {
    self.res.cookie(Session.key, session.id, {
      maxAge: session.maxAge,
      signed: true
    })
    self.session = session.cache
    next()
  }

  var sid = this.cookies[Session.key]
  if (sid) {
    Session.get(sid, function (err, sess) {
      if (err) return next(err)
      session = sess
      if (session != null) {
        // 本地存储
        if (Session.pool.local) {
          session.update()
        } else {
          session.cache.__proto__ = session
        }
      } else {
        session = new Session()
      }
      done()
    })
  } else {
    session = new Session()
    done()
  }
}
