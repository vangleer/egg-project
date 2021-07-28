# 后端环境 docker部署 eggjs+redis+mysql+mosquito

## 安装 redis
```
拉取redis镜像
docker pull redis
启动容器
docker run -itd --name redis-server -p 6379:6379 redis
```
## 安装 mysql
```
拉取mysql镜像
docker pull mysql:5.7
启动容器
docker run -itd --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7
```

## 安装 mosquito 服务
- 安装
    ```
    拉取mysql镜像
    docker pull docker pull eclipse-mosquitto:1.5.8
    启动容器
    docker run -it -d --name mosquitto -p 1883:1883 -p 11883:11883 eclipse-mosquitto:1.5.8
    ```
- 配置mosquito
    ```
    1.进入容器
    docker exec -it mosquitto sh

    2.配置文件添加以下配置 
      vi mosquitto/config/mosquitto.conf
      ## 关闭匿名模式
      allow_anonymous false
      ## 指定密码文件
      password_file /mosquitto/config/pwfile.conf

    3.生成密码
      touch /mosquitto/config/pwfile.conf
      chmod -R 755 /mosquitto/config/pwfile.conf
      # 使用mosquitto_passwd命令创建用户，第一个admin是用户名，第二个Senscape是密码
      mosquitto_passwd -b /mosquitto/config/pwfile.conf admin Senscape

    4.添加websockets配置
      vi mosquitto/config/mosquitto.conf
      # 服务器连接端口
      port 1883
      # 客户端连接端口
      listener 11883
      # 协议指定websickets
      protocol websockets

    5.重启mqtt服务
      docker restart mosquitto
    ```

## docker打包部署

## vue-api  egg项目
- 拉取egg项目 执行 npm i
- 修改package.json 的 start执行命令  删除 --daemon
- 在项目根目录下创建 Dockerfile文件
    ```
    # node镜像
    FROM node:12-alpine

    # 设置时区
    # RUN apk --update add tzdata \
    #     && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    #     && echo "Asia/Shanghai" > /etc/timezone \
    #     && apk del tzdata

    # 这个是容器中的文件目录
    RUN mkdir -p /usr/src/app 

    # 设置工作目录
    WORKDIR /usr/src/app

    # 拷贝package.json文件到工作目录
    # !!重要：package.json需要单独添加。
    # Docker在构建镜像的时候，是一层一层构建的，仅当这一层有变化时，重新构建对应的层。
    # 如果package.json和源代码一起添加到镜像，则每次修改源码都需要重新安装npm模块，这样木有必要。
    # 所以，正确的顺序是: 添加package.json；安装npm模块；添加源代码。
    COPY package.json /usr/src/app/package.json

    # 安装npm依赖(使用淘宝的镜像源)
    # 如果使用的境外服务器，无需使用淘宝的镜像源，即改为`RUN npm i`。
    RUN npm i --production --registry=https://registry.npm.taobao.org

    # 拷贝所有源代码到工作目
    COPY . /usr/src/app
    # 暴露容器端口
    EXPOSE 7001
    CMD [ "npm", "start" ]
    ```
- 构建镜像 docker build -t vue-api .
- 运行容器 docker run -p 7001:7001 -d --name vue-api vue-api

## 创建eggjs项目 -- 推荐参考官方文档

- 初始化项目
    ```
    mkdir egg-example && cd egg-example
    npm init egg --type=simple
    npm i
    ```
- 启动项目
    ```
    npm run dev
    open http://localhost:7001
    ```
## 配置mysql
- 下载插件egg-sequelize+mysql2
    ```
    npm install --save egg-sequelize mysql2
    ```
- 在 config/plugin.js 中引入 egg-sequelize 插件
    ```javascript
    exports.sequelize = {
      enable: true,
      package: 'egg-sequelize',
    };
    ```
- 在 config/config.default.js 中编写 sequelize 配置
    ```javascript
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
    };
    ```
## 配置redis
- 下载插件egg-redis
    ```
    npm install --save egg-redis
    ```
- 在 config/plugin.js 中引入 egg-redis 插件
    ```javascript
    exports.redis = {
      enable: true,
      package: 'egg-redis',
    };
    ```
- 在 config/config.default.js 中编写 redis 配置
    ```javascript
      config.redis = {
        client: {
          port: 6379,
          host: '127.0.0.1,'
          password: '',
          db: 0,
        }
      }
    ```

## 配置mosquito
- 下载插件egg-emqtt
    ```
    npm install --save egg-emqtt
    ```
- 在 config/plugin.js 中引入 egg-emqtt 插件
    ```javascript
    exports.emqtt = {
      enable: true,
      package: 'egg-emqtt',
    };
    ```
- 在 config/config.default.js 中编写 mosquito 配置
    ```javascript
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
          // host: `mqtt://127.0.0.1:1883`,
          username: 'admin',
          password: '123456',
          clientId,
          options,
          msgMiddleware: []
        }
      }
    }
    ```