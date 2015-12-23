var cluster = require('cluster');

exports.Runner = function (req, res) {


  console.log('req.originalUrl :', req.originalUrl);
  console.log('req.baseUrl     :', req.baseUrl);
  console.log('req.protocol    :', req.protocol);
  console.log('req.hostname    :', req.hostname);
  console.log('req.query       :', req.query);
  console.log('req.pathname    :', req.pathname);
  console.log('req.cookies     :', req.cookies);
  console.log('req.params      :', req.params);
  console.log('req.session     :', req.session);
  console.log('req.body        :', req.body);
  console.log('req.files       :', req.files);
  console.log('multipartResolver       :', req.context.parentContext.multipartResolver);

  req.session.user = {name: 'wanglei', r: Math.random()};

  res.ok();

};