<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="所属用户">
        <template slot-scope="scope">
          {{ scope.row.user.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="提交时间">
        <template slot-scope="scope">
          {{ scope.row.submit_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleShow(scope)">
            查看
          </el-button>
          <el-button type="danger" size="small" @click="handleReview(scope, 9)">
            通过
          </el-button>
          <el-button type="danger" size="small" @click="handleReview(scope, 8)">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getArticleDrafts" />

  </div>
</template>

<script>
import { getArticleDrafts, review } from '@/api/articleDraft'
import Pagination from '@/components/Pagination'

const defaultArticle = {
  name: '',
  password: ''
}

export default {
  name: 'ArticlePublish',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      article: Object.assign({}, defaultArticle),
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.getArticleDrafts()
  },
  methods: {
    async getArticleDrafts() {
      this.listLoading = true
      const res = await getArticleDrafts({ page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async handleReview({ $index, row }, status) {
      await review(row.id, { status: status })
      this.list.splice($index, 1)
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
    }
  }
}
</script>
