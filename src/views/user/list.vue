<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="用户名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="昵称">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="手机号">
        <template slot-scope="scope">
          {{ scope.row.mobile }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="头像">
        <template slot-scope="scope">
          <img style="max-width:100px;" :src="scope.row.avatar">
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getUsers" />
  </div>
</template>

<script>
import { getUsers } from '@/api/user'
import Pagination from '@/components/Pagination'

export default {
  name: 'UserList',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
    async getUsers() {
      this.listLoading = true
      const res = await getUsers({ page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    }
  }
}
</script>
