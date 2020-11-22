<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.projectTitle" placeholder="项目名" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.name" placeholder="商品名" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.promote" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option label="所有" value="all" />
        <el-option label="推广中" value="1" />
      </el-select>
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
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button v-if="scope.row.promote === 0" type="primary" size="small" @click="handlePromote(scope, 1)">
            推广
          </el-button>
          <el-button v-if="scope.row.promote === 1" type="warning" size="small" @click="handlePromote(scope, 0)">
            取消推广
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getGoods" />

  </div>
</template>

<script>
import { getGoods, updateGoods } from '@/api/goods'
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
        projectTitle: '',
        promote: 'all'
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
        projectTitle: this.listQuery.projectTitle,
        promote: this.listQuery.promote
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async handlePromote(scope, promote) {
      await updateGoods(scope.row.id, { promote })
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].id === scope.row.id) {
          this.list[index].promote = promote
          break
        }
      }
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
    }
  }
}
</script>
