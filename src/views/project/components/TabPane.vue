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
          {{ scope.row.draftVs.title }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="提交时间">
        <template slot-scope="scope">
          {{ scope.row.draftVs.submit_at }}
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
          <el-button v-if="status==='review'" type="danger" size="small" @click="handleRefuse(scope)">
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getProjects" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='pass'?'发布上线':'拒绝'">
      <el-form ref="reviewForm" :model="draftVersion" label-width="80px" label-position="left">
        <el-form-item v-if="dialogType==='pass'" label="平台" prop="platform_id" :rules="[{ required: true, message: '不能为空'},]">
          <el-select v-model="draftVersion.platform_id" placeholder="请选择">
            <el-option
              v-for="platform in platforms"
              :key="platform.id"
              :label="platform.name"
              :value="platform.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType==='refuse'" label="拒绝原因" prop="review_remarks" :rules="[{ required: true, message: '不能为空'},]">
          <el-input
            v-model="draftVersion.review_remarks"
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
import { getProjects, pass, refuse, publishPreview } from '@/api/project'
import { getPlatforms } from '@/api/platform'
import Pagination from '@/components/Pagination'
import { deepClone } from '@/utils'

export default {
  name: 'ProjectReview',
  components: { Pagination },
  props: {
    status: {
      type: String,
      default: 'review'
    }
  },
  data() {
    return {
      listLoading: true,
      platforms: [],
      draftVersion: {
        platform_id: []
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
    this.getProjects()
    this.getPlatforms()
  },
  methods: {
    async getProjects() {
      this.listLoading = true
      const res = await getProjects({ status: this.status, page: this.listQuery.page })
      this.list = res.data
      this.listQuery.page = res.meta.current_page
      this.listQuery.limit = res.meta.per_page
      this.total = res.meta.total
      this.listLoading = false
    },
    async getPlatforms() {
      const res = await getPlatforms()
      this.platforms = res.data
    },
    handlePreview(scope) {
      publishPreview(scope.row.id).then(res => {
        this.previewHeight = document.documentElement.clientHeight
        this.previewVisable = true
        this.previewUrl = res.data.url
      })
    },
    async handlePass(scope) {
      this.dialogType = 'pass'
      this.draftVersion = deepClone(scope.row.draftVs)
      this.$set(this.draftVersion, 'project_id', scope.row.id)
      this.dialogVisible = true
      this.$nextTick(function() {
        this.$refs.reviewForm.clearValidate()
      })
    },
    handleRefuse(scope) {
      this.dialogVisible = true
      this.dialogType = 'refuse'
      this.draftVersion = deepClone(scope.row.draftVs)
      this.$set(this.draftVersion, 'project_id', scope.row.id)
      this.$set(this.draftVersion, 'review_remarks', '')
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
        await pass(this.draftVersion.project_id, { platform_id: this.draftVersion.platform_id })
      } else {
        await refuse(this.draftVersion.project_id, { review_remarks: this.draftVersion.review_remarks })
      }
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].draftVs.id === this.draftVersion.id) {
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
