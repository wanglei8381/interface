var tools = require('./util/tools');
var serviceConfig = require('./service_config');

module.exports = function(templateService,service){
  this.deploySuccess = true;
  tools.replace(templateService, service, true);
  for(var key in templateService) {
    this[key] = templateService[key];
  }

};