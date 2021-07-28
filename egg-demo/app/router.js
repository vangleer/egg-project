'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  app.beforeStart(async () => {
    await app.model.sync({ alter: true }) //force  false 为不覆盖 true会删除再创建; alter true可以 添加或删除字段;
 })
  router.get('/', controller.home.index)
  router.get('/users', controller.home.getUserList)

  require('./router/mqtt')(app)
}
