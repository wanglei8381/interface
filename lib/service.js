var tools = require('./util/tools');
var service_config = require('./service_config');

module.exports = function(templateService,service){
  tools.replace(templateService, service, true);
  for(var key in templateService) {
    this[key] = templateService[key];
  }

};