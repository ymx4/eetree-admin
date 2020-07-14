<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.projectTitle" placeholder="项目名" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.goodsName" placeholder="商品名" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品名">
        <template slot-scope="scope">
          {{ scope.row.goods.name }}
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
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button v-if="scope.row.published === 0" type="primary" size="small" @click="handlePublish(scope, 1)">
            上线
          </el-button>
          <el-button v-if="scope.row.published === 1" type="warning" size="small" @click="handlePublish(scope, 0)">
            下线
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getGoodsTrials" />

  </div>
</template>

<script>
import { getGoodsTrials, updateGoodsTrial } from '@/api/goods'
import Pagination from '@/components/Pagination'

export default {
  name: 'GoodsTrialList',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        goodsName: '',
        projectTitle: ''
      }
    }
  },
  created() {
    this.getGoodsTrials()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getGoodsTrials()
    },
    async getGoodsTrials() {
      this.listLoading = true
      const res = await getGoodsTrials({
        page: this.listQuery.page,
        goodsName: this.listQuery.goodsName,
        projectTitle: this.listQuery.projectTitle
      })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async handlePublish(scope, publish) {
      await updateGoodsTrial(scope.row.id, { publish })
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].id === scope.row.id) {
          this.list[index].published = publish
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
