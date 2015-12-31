var RedisPool = require("./redis_pool");
var logger = require('../logger')('[Interface][session_pool]');

//session池对象
var sessionPool = module.exports = {
  "key": "I_F_SID",
  "sessions": null,
  "maxAge": 20,
  "secret": "DEF_INTERFACE_SECRET",
  "local": false,
  "host": "127.0.0.1",
  "port": 6379,
  "poolsize": 10,
  "db": 2,
  "authpass": null
};

/**
 * session配置
 * @param options
 */
sessionPool.setConfig = function (options) {
  options = options || {};
  for (var key in options) {
    this[key] = options[key];
  }

  //logger.debug('[setConfig]配置session信息', this.local);

  //本地存储
  if (this.local) {
    //本地存储池
    this.sessions = Object.create(null);
    //上次本地存储池清理时间
    this.lastClearTime = Date.now();
    //每次清理的间隔时间（默认1小时）
    this.intervalTime = 1000 * 60 * 60;
  } else {
    this.RP = new RedisPool({
      host: options.host,
      port: options.port,
      db: options.db,
      poolmax: options.poolmax,
      authpass: options.authpass
    });
  }

};

/**
 * 添加一个session
 * @param session
 * @returns {*}
 */
sessionPool.set = function (session) {
  var self = this;
  if (this.local) {
    this.sessions[session.id] = session;
  } else {
    this.RP.acquire(function (client) {
      if (!client) return;
      client.SET('AUTH::' + session.id, JSON.stringify(session), 'EX', self.maxAge * 60, function (err, data) {
        logger.debug('[redis set]add or edit session', 'err:' + err, 'data:' + data);
        client.release();
      });

    });
  }

}

/**
 * 获取一个session
 * @param sid
 * @returns {*}
 */
sessionPool.get = function (sid, callback) {
  callback = callback || function (err, data) {
      return data;
    };

  if (this.local) {
    this.clear();
    var sess = this.sessions[sid];

    if (!sess) {
      logger.debug('[get]', 'no session');
      return callback(new Error('no session'));
    }

    if (sess.expire > Date.now()) {
      return callback(null, sess);
    } else {
      logger.debug('[get]', 'session timeout');
      delete this.sessions[sid];
      return callback(new Error('session timeout'));
    }
  } else {
    this.RP.acquire(function (client) {
      if (!client) return callback(new Error('Unable to get redis client'));
      client.GET('AUTH::' + sid, function (err, data) {
        logger.debug('[redis get]get session', 'err:' + err, 'data:' + data);
        if (!err) {
          data = JSON.parse(data);
        }
        callback(err, data);
        client.release();
      });

    });
  }

}

/**
 * 删除一个session
 * @param sid
 */
sessionPool.remove = function (sid) {
  if (this.local) {
    if (sessions[sid]) {
      delete sessions[sid];
    }
  } else {
    this.RP.acquire(function (client) {
      if (!client) return;
      client.DEL('AUTH::' + sid, function (err, data) {
        logger.debug('[redis remove]del session', 'err:' + err, 'data:' + data);
        client.release();
      });

    });
  }
};


//如果是本地存储，清除无效的session
sessionPool.clear = function () {
  if (!this.local) return;

  //每隔一个小时清空一下数据
  if (Date.now() - this.lastClearTime < this.intervalTime) {
    return;
  }
  this.lastClearTime = Date.now();
  var sessions = this.sessions;
  for (var key in sessions) {
    var sess = sessions[key];
    if (sess.expire <= Date.now()) {
      delete sessions[key];
    }
  }
};