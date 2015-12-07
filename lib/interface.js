require('./global');
var Server = require('./server');
var logger = require('./logger')('[interface]');


exports.Runner = function (path) {

  var server = Server.start(path);

};


console.log("-----------------------------------------[Interface] VERSION 0.0.3---------------------------------------------");