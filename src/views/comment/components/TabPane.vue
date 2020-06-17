<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="评论用户" width="100">
        <template slot-scope="scope">
          {{ scope.row.user.nickname }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="status === 'project' ? '评论项目' : '评论文档'" width="100">
        <template slot-scope="scope">
          <el-link type="primary" :href="status === 'project' ? scope.row.project.url : scope.row.doc.url" target="_blank">
            {{ status === 'project' ? scope.row.project.title : scope.row.doc.title }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="评论时间" width="120">
        <template slot-scope="scope">
          {{ scope.row.created_at }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="评论内容">
        <template slot-scope="scope">
          {{ scope.row.content }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.active == 1" type="danger" size="small" @click="toggleActive(scope)">
            屏蔽
          </el-button>
          <el-button v-if="scope.row.active == 0" type="primary" size="small" @click="toggleActive(scope)">
            公开
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getComments" />
  </div>
</template>

<script>
import { getComments, toggleActive } from '@/api/comment'
import Pagination from '@/components/Pagination'

export default {
  name: 'CommentPane',
  components: { Pagination },
  props: {
    status: {
      type: String,
      default: 'doc'
    }
  },
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
    this.getComments()
  },
  methods: {
    async getComments() {
      this.listLoading = true
      const res = await getComments({ page: this.listQuery.page, sType: this.status })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async toggleActive(scope) {
      const res = await toggleActive(scope.row.id)
      scope.row.active = res.data.active
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
    }
  }
}
</script>
