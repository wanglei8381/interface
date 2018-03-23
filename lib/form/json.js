var getBody = require('raw-body')

var regexp = /^application\/([\w!#\$%&\*`\-\.\^~]*\+)?json$/i

exports = module.exports = function json (options) {
  options = options || {}

  return function (req, res, next) {
    if (req._body || req.method.toLowerCase() !== 'post') return next()
    req.body = req.body || {}
    if (!req.hasBody()) return next()

    if (!regexp.test(req.mime())) return next()

    req._body = true

    getBody(
      req,
      {
        limit: options.limit || '1mb',
        length: req.headers['content-length'],
        encoding: 'utf8'
      },
      function (err, buf) {
        if (err) return next(err)
        try {
          req.body = JSON.parse(buf)
          next()
        } catch (err) {
          err.body = buf
          err.status = 400
          next(err)
        }
      }
    )
  }
}
