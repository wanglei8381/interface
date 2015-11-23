require('./global');
var Server = require('./server');

exports.Runner = function(path){
  console.time('Service startup time');
  var server = new Server(path);
  console.timeEnd('Service startup time');
  var services = server.services;
  for(var key in services) {
    console.log(services[key]);
  }
};