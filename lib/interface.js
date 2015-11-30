require('./global');
var Server = require('./server');
var logger = require('./logger')('[interface]');


exports.Runner = function (path) {

  var server = Server.start(path);

  server.services.msg.i_fs.each(function(i_f){
    if(i_f.deploySuccess){
      i_f.Runner();
    }
  });
  //console.log(server.services.msg.i_fs);
};