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
          <el-button type="primary" size="small" @click="handlePreview(scope)">
            预览
          </el-button>
          <el-button type="success" size="small" @click="handlePass(scope)">
            通过并上线
          </el-button>
          <el-button v-if="status==='submit'" type="danger" size="small" @click="handleRefuse(scope)">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getDocPublishs" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='pass'?'发布上线':'拒绝'">
      <el-form ref="reviewForm" :model="docPublish" label-width="80px" label-position="left">
        <el-form-item v-if="dialogType==='pass'" label="分类" prop="docCategory" :rules="[{ required: true, message: '不能为空'},]">
          <el-select v-model="docPublish.docCategory" multiple placeholder="请选择">
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType==='refuse'" label="拒绝原因" prop="review_remarks" :rules="[{ required: true, message: '不能为空'},]">
          <el-input
            v-model="docPublish.review_remarks"
            type="textarea"
            :rows="2"
            placeholder="请输入拒绝的原因"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmSubmit">
          提交
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="previewVisable" title="预览" :fullscreen="true">
      <iframe :src="previewUrl" style="width: 100%; border: 0;" :height="previewHeight" />
    </el-dialog>
  </div>
</template>

<script>
import { getDocPublishs, pass, refuse, publishPreview } from '@/api/docPublish'
import { getCategories } from '@/api/category'
import Pagination from '@/components/Pagination'
import { unflatten, deepClone, selectOptions } from '@/utils'

const statusMap = {
  submit: 1,
  refuse: 8
}
export default {
  name: 'DocPublish',
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
      categories: [],
      docPublish: {
        docCategory: []
      },
      list: [],
      dialogVisible: false,
      dialogType: 'pass',
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      previewVisable: false,
      previewUrl: '',
      previewHeight: 0
    }
  },
  created() {
    this.getDocPublishs()
    this.getCategories()
  },
  methods: {
    async getDocPublishs() {
      this.listLoading = true
      const res = await getDocPublishs({ status: statusMap[this.status], page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async getCategories() {
      const res = await getCategories()
      const tree = unflatten(res.data)
      this.categories = selectOptions(tree, 'name', 'id')
    },
    handlePreview(scope) {
      publishPreview(scope.row.id).then(res => {
        this.previewHeight = document.documentElement.clientHeight
        this.previewVisable = true
        this.previewUrl = res.data.url
      })
    },
    async handlePass(scope) {
      this.dialogVisible = true
      this.dialogType = 'pass'
      this.docPublish = deepClone(scope.row)
      this.$nextTick(function() {
        this.$refs.reviewForm.clearValidate()
      })
    },
    handleRefuse(scope) {
      this.dialogVisible = true
      this.dialogType = 'refuse'
      this.docPublish = deepClone(scope.row)
      this.$set(this.docPublish, 'review_remarks', '')
      this.$nextTick(function() {
        this.$refs.reviewForm.clearValidate()
      })
    },
    async confirmSubmit() {
      this.$refs.reviewForm.validate(async(valid) => {
        if (valid) {
          if (this.dialogType === 'pass') {
            await pass(this.docPublish.id, { category_id: this.docPublish.docCategory })
          } else {
            await refuse(this.docPublish.id, { review_remarks: this.docPublish.review_remarks })
          }
          for (let index = 0; index < this.list.length; index++) {
            if (this.list[index].id === this.docPublish.id) {
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
