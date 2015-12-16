var cluster = require('cluster');

exports.Runner = function (req, res) {


  console.log('req.originalUrl :', req.originalUrl);
  console.log('req.baseUrl     :', req.baseUrl);
  console.log('req.protocol    :', req.protocol);
  console.log('req.hostname    :', req.hostname);
  console.log('req.query       :', req.query);
  console.log('req.pathname    :', req.pathname);
  console.log('req.cookies     :', req.cookies);

  if (cluster.isWorker) {
    console.log('app', cluster.worker.id);
  } else {
    console.log('app', 'master');
  }

  console.log('#######session', req.session);

  req.session.user = {name: 'wanglei', r: Math.random()};

  res.ok();

};