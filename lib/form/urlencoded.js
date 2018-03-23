var getBody = require('raw-body')
var qs = require('querystring')

exports = module.exports = function (options) {
  options = options || {}
  var verify = typeof options.verify === 'function' && options.verify

  return function urlencoded (req, res, next) {
    if (req._body || req.method.toLowerCase() !== 'post') return next()
    req.body = req.body || {}

    if (!req.hasBody()) return next()
    // check Content-Type
    if (req.mime() != 'application/x-www-form-urlencoded') return next()

    req._body = true

    // parse
    getBody(
      req,
      {
        limit: options.limit || '1mb',
        length: req.headers['content-length'],
        encoding: 'utf8'
      },
      function (err, buf) {
        if (err) return next(err)
        if (verify) {
          try {
            verify(req, res, buf)
          } catch (err) {
            if (!err.status) err.status = 403
            return next(err)
          }
        }

        try {
          req.body = buf.length ? qs.parse(buf) : {}
        } catch (err) {
          err.body = buf
          return next(err)
        }
        next()
      }
    )
  }
}
