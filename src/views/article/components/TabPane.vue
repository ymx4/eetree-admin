<template>
  <div>
    <el-table v-loading="listLoading" :data="list" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="作者">
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
          <el-button type="success" size="small" @click="handlePass(scope)">
            通过
          </el-button>
          <el-button v-if="status==='submit'" type="danger" size="small" @click="handleRefuse(scope)">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getArticleDrafts" />
  </div>
</template>

<script>
import { getArticleDrafts, pass, refuse } from '@/api/articleDraft'
import Pagination from '@/components/Pagination'

const statusMap = {
  submit: 1,
  refuse: 8
}

export default {
  name: 'ArticlePublish',
  components: { Pagination },
  props: {
    status: {
      type: String,
      default: 'submit'
    }
  },
  data() {
    return {
      listLoading: true,
      articleDraft: {},
      list: [],
      dialogVisible: false,
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
      const res = await getArticleDrafts({ status: statusMap[this.status], page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async handlePass({ $index, row }) {
      this.$confirm('确定要通过吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await pass(row.id)
          this.list.splice($index, 1)
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    handleRefuse(scope) {
      this.dialogVisible = true
      this.articleDraft = {
        id: scope.row.id,
        review_remarks: ''
      }
    },
    async confirmRefuse() {
      this.$refs.reviewForm.validate(async(valid) => {
        if (valid) {
          await refuse(this.articleDraft.id, { review_remarks: this.articleDraft.review_remarks })
          for (let index = 0; index < this.list.length; index++) {
            if (this.list[index].id === this.articleDraft.id) {
              this.list.splice(index, 1)
              break
            }
          }

          this.dialogVisible = false
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
