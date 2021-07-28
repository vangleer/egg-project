// 盒子推送无人机告警数据
'use strict'

module.exports = app => {
  return class SenscapeGwe extends app.Controller {
    async getMsg() {
      const { ctx } = this
      let { topic, msg } = ctx.req
      try {
        console.log(topic, msg)
      } catch (error) {
        console.log('json parse error', error)
      }
    }
  }
}

