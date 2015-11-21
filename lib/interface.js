require('./global');
var Server = require('./server');

exports.Runner = function(path){
  var server = new Server(path);

};