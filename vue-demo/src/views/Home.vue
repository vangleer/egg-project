<template>
  <div class="home">
    <el-button @click="getUserList">获取用户列表</el-button>
     <el-table :data="tableData">
      <el-table-column prop="realname" label="姓名" />
      <el-table-column prop="age" label="年龄" />
      <el-table-column prop="createdAt" label="添加时间" />
    </el-table>
  </div>
</template>

<script>
import { getUserList } from '@/api/index.js'

export default {
  name: 'Home',
  data() {
    return {
      tableData: []
    }
  },
  methods: {
    async getUserList() {
      const res = await getUserList()
      if (res.status === 0) {
        this.tableData = res.data
      }
    }
  }
}
</script>
