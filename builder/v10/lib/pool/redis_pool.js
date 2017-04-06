var poolModule = require('generic-pool');
var redis = require("redis");

/**
 * 生成一个redisPool对象
 * @param options
 *  options.db
 *    选择redis数据库，默认是第0个
 *  options.host
 *    连接redis的host地址，默认127.0.0.1
 *  options.port
 *    连接redis的端口号，默认6379
 *  options.authpass
 *    连接redis的密码，默认空
 *  options.poolmax
 *    连接池的最大连接数，默认10
 *  options.poolmin
 *    连接池的最小连接数，默认0
 *
 * @returns {RedisPool}
 * @constructor
 */
function RedisPool(options) {
  if (this instanceof RedisPool) {
    options = options || {};
    var self = this;
    self.host = options.host ? options.host : "127.0.0.1";
    self.port = options.port ? options.port : 6379;
    self.db = options.db ? options.db : 0;
    self.poolmax = options.poolmax ? options.poolmax : 1;
    self.poolmin = options.poolmin ? options.poolmin : 0;
    self.authpass = options.authpass ? options.authpass : undefined;

    self.pool = poolModule.Pool({
      name: 'redis',
      create: function (callback) {
        try {
          var client = redis.createClient(self.port, self.host, {retry_max_delay: 5000, auth_pass: self.authpass});
          client.poolStatus = 0;

          client.release = function () {
            self.pool.release(this);
          };

          client.on("ready", function () {
            client.select(self.db, function () {
              client.poolStatus = 1;
              callback(null, client);
            });
          });

          client.on("error", function (e) {
            console.error('[RedisPool]', e);
            //启动报错
            if (!client.poolStatus) {
              client.poolStatus = -1;
              client.end(e);
              callback(e);
            }
          });

          client.on("end", function (e) {
            e = e || {message: 'a redis client  is closed'};
            console.warn('[RedisPool]', e.message);
          });

        } catch (e) {
          callback(e);
        }
      },
      destroy: function (client) {
        client.closing = true;
        client.end();
      },
      max: self.poolmax,
      min: self.poolmin,
      idleTimeoutMillis: 0,
      reapIntervalMillis: -1,
      log: false
    });
    return this;
  }

  return new RedisPool();
}

/**
 * 从连接池中获取一个client对象，如果出错或生成客户端时出错，则返回空，否则返回一个客户端
 * @param callback
 */
RedisPool.prototype.acquire = function (callback) {

  this.pool.acquire(function (err, client) {
    if (!err) {
      callback((client.poolStatus === 1) ? client : null);
      if (client.poolStatus === -1)
        client.release();
    } else {
      callback(null);
    }
  });
}

module.exports = RedisPool;
module.exports.redis = redis;