var cluster = require('cluster');

exports.Runner = function(req, res){

  if(cluster.isWorker) {
    console.log('app',cluster.worker.id);
  } else {
    console.log('app','master');
  }

  res.ok();

};