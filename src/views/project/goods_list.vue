<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.projectTitle" placeholder="项目名" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.name" placeholder="商品名" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="商品名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="项目名">
        <template slot-scope="scope">
          {{ scope.row.project.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="所有者">
        <template slot-scope="scope">
          {{ scope.row.user.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="价格">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getGoods" />

  </div>
</template>

<script>
import { getGoods } from '@/api/goods'
import Pagination from '@/components/Pagination'

export default {
  name: 'GoodsList',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        projectTitle: ''
      }
    }
  },
  created() {
    this.getGoods()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getGoods()
    },
    async getGoods() {
      this.listLoading = true
      const res = await getGoods({
        page: this.listQuery.page,
        name: this.listQuery.name,
        projectTitle: this.listQuery.projectTitle
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    }
  }
}
</script>
