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
          <el-button type="success" size="small" @click="handlePass(scope)">
            通过
          </el-button>
          <el-button type="danger" size="small" @click="handleRefuse(scope)">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getArticleDrafts" />

    <el-dialog :visible.sync="dialogVisible" title="拒绝">
      <el-form ref="reviewForm" :model="articleDraft" label-width="80px" label-position="left">
        <el-form-item label="拒绝原因">
          <el-input v-model="articleDraft.review_remarks" :rows="3" type="textarea" placeholder="拒绝原因" :rules="[{ required: true, message: '不能为空'},]" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmRefuse">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getArticleDrafts, pass, refuse } from '@/api/articleDraft'
import Pagination from '@/components/Pagination'

export default {
  name: 'ArticlePublish',
  components: { Pagination },
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
      const res = await getArticleDrafts({ status: 1, page: this.listQuery.page })
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
