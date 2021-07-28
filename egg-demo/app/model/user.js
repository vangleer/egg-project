'use strict'

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize
  const User = app.model.define('user', {
    username: { type: STRING, allowNull: true, comment: '用户名' },
    password: { type: STRING, allowNull: true, comment: '密码' },
    realname: { type: STRING, allowNull: true, comment: '真实姓名' },
    age: { type: INTEGER, allowNull: true, comment: '年龄' }
  })
  return User
}
