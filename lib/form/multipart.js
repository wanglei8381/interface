var formidable = require('formidable');

exports = module.exports = function json(options) {
  options = options || {};

  return function (req, res, next) {
    var multipartResolver = req.context.parentContext.multipartResolver;
    if (req._body || req.method.toLowerCase() !== "post" || !multipartResolver.auto) return next();

    req.body = req.body || {};
    req.files = req.files || {};
    if (!req.hasBody()) return next();

    if ('multipart/form-data' != req.mime()) return next();

    req._body = true;

    var form = new formidable.IncomingForm();
    form.uploadDir = multipartResolver.path;
    form.parse(req, function (err, fields, files) {
      if (err) return next(err);
      req.body = fields;
      if (!Object.isEmpty(files)) {
        for (var key in files) {
          var file = files[key];
          req.files[key] = {
            path: file.path,
            size: file.size,
            name: file.name,
            type: file.type,
            hash: file.hash,
            lastModifiedDate: file.lastModifiedDate
          };
        }
      }
      next();
    });

  };

}