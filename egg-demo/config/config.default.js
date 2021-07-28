
'use strict';
const BASE_URL = '192.168.99.100'
module.exports = appInfo => {
  const config = exports = {};

  config.keys = appInfo.name + '_hwt';

  config.middleware = [];

  const userConfig = {
    // myAppName: 'egg',
  };

  // 配置mysql
  config.sequelize = {
    Sequelize: require('sequelize'),
    dialect: 'mysql',
    database: 'demo',
    host: BASE_URL,
    port: 3306,
    username: 'root',
    password: '123456',
    define: { // model的全局配置
      timestamps: true, // 添加create,update,delete时间戳
      // paranoid: true, // 添加软删除
      freezeTableName: true, // 防止修改表名为复数
      underscored: false // 防止驼峰式字段被默认转为下划线
    },
    timezone: '+08:00', // 由于orm用的UTC时间，这里必须加上东八区，否则取出来的时间相差8小时
    dialectOptions: { // 让读取date类型数据时返回字符串而不是UTC时间
      dateStrings: true,
      typeCast(field, next) {
        if (field.type === 'DATETIME') {
          return field.string()
        }
        return next()
      }
    }
  }

  // 配置redis
  config.redis = {
    client: {
      port: 6379,
      host: BASE_URL,
      password: '',
      db: 0,
    }
  }

  // 配置mosquito
  const options = {
    keepalive: 60,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    rejectUnauthorized: false,
    qos: 0
  }
  const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
  config.emqtt = {
    clients: {
      uav: {
        host: `mqtt://${BASE_URL}:1883`,
        username: 'admin',
        password: 'Senscape',
        clientId,
        options,
        msgMiddleware: []
      }
    }
  }

  return {
    ...config,
    ...userConfig,
  };
};
