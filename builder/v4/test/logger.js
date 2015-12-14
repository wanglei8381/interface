var Logger = require('../lib/logger');
Logger.setLevel(4);
logger = Logger('[test]');
logger.debug('hello');
logger.info('world');
logger.error('error');