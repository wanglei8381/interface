var qs = require('querystring')
var unsign = require('cookie-signature').unsign
var encode = encodeURIComponent
var decode = decodeURIComponent

var serialize = function (name, val, opt) {
  opt = opt || {}
  var enc = opt.encode || encode
  var pairs = [name + '=' + enc(val)]

  if (opt.maxAge != null) {
    var maxAge = opt.maxAge - 0
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number')
    pairs.push('Max-Age=' + maxAge)
  }

  if (opt.domain) pairs.push('Domain=' + opt.domain)
  if (opt.path) pairs.push('Path=' + opt.path)
  if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString())
  if (opt.httpOnly) pairs.push('HttpOnly')
  if (opt.secure) pairs.push('Secure')

  return pairs.join('; ')
}

var parse = function (str, opt) {
  opt = opt || {}
  var secret = opt.secret
  var obj = qs.parse(str.replace(/[ ]/g, ''), ';', '=')
  var dec = opt.decode || decode

  for (var key in obj) {
    var str = obj[key]
    str = dec(str)
    if (secret != null) {
      str = str.substr(0, 2) === 's:' ? unsign(str.slice(2), secret) : str
    }
    obj[key] = str
  }

  return obj
}

exports.serialize = serialize
exports.parse = parse
