'use strict'

module.exports = {
  // worker 类型：每台机器上只有一个 worker 会执行这个定时任务，每次执行定时任务的 worker 的选择是随机的。
  // all 类型：每台机器上的每个 worker 都会执行这个定时任务。
  schedule: {
    interval: '10s', // 间隔
    type: 'worker',
    disable: true,
  },
  async task(ctx) {
    // 红外热成像
    await ctx.app.emqtt.get('uav').publish('/test', '测试啦啦啦啦', { qos: 0 })
  },
}
