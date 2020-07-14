<template>
  <div>
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
          <el-button type="success" size="small" @click="handlePass(scope)">
            通过
          </el-button>
          <el-button v-if="status==='submit'" type="danger" size="small" @click="handleRefuse(scope)">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getGoodsTrials" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='pass'?'发布上线':'拒绝'">
      <el-form ref="reviewForm" :model="goodsTrial" label-width="80px" label-position="left">
        <el-form-item v-if="dialogType==='refuse'" label="拒绝原因" prop="review_remarks" :rules="[{ required: true, message: '不能为空'},]">
          <el-input
            v-model="goodsTrial.review_remarks"
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
import { getGoodsTrials, reviewTrial } from '@/api/goods'
import { getStatus } from '@/api/common'
import Pagination from '@/components/Pagination'
import { deepClone } from '@/utils'

export default {
  name: 'TrialReviewTab',
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
      platforms: [],
      goodsTrial: {},
      commonStatus: {},
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
    this.commonStatus = getStatus()
    this.getGoodsTrials()
  },
  methods: {
    async getGoodsTrials() {
      this.listLoading = true
      const res = await getGoodsTrials({ draft: true, status: this.commonStatus[this.status], page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async handlePass(scope) {
      this.dialogType = 'pass'
      this.goodsTrial = deepClone(scope.row)
      this.dialogVisible = true
      this.$nextTick(function() {
        this.$refs.reviewForm.clearValidate()
      })
    },
    handleRefuse(scope) {
      this.dialogVisible = true
      this.dialogType = 'refuse'
      this.goodsTrial = deepClone(scope.row)
      this.$set(this.goodsTrial, 'review_remarks', '')
      this.$nextTick(function() {
        this.$refs.reviewForm.clearValidate()
      })
    },
    async confirmSubmit() {
      this.$refs.reviewForm.validate(async(valid) => {
        if (valid) {
          this.doReview()
        } else {
          return false
        }
      })
    },
    async doReview() {
      if (this.dialogType === 'pass') {
        await reviewTrial(this.goodsTrial.id, { status: this.commonStatus.pass })
      } else {
        await reviewTrial(this.goodsTrial.id, { status: this.commonStatus.refuse, review_remarks: this.goodsTrial.review_remarks })
      }
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].id === this.goodsTrial.id) {
          this.list.splice(index, 1)
          break
        }
      }

      this.dialogVisible = false
      this.$message({
        type: 'success',
        message: '操作成功!'
      })
    }
  }
}
</script>
