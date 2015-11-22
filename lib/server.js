var serverConfig = require('./server_config');

module.exports = function(path){
  this.workpath = path;
  serverConfig.parseConfig(this);
  console.log(this);
};