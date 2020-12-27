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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getDrafts" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='pass'?'发布上线':'拒绝'">
      <el-form ref="reviewForm" :model="projectDraft" label-width="80px" label-position="left">
        <el-form-item v-if="dialogType==='pass'" label="平台" prop="platform_id" :rules="[{ required: true, message: '不能为空'},]">
          <el-select v-model="projectDraft.platform_id" placeholder="请选择">
            <el-option label="请选择" :value="0" />
            <el-option
              v-for="platform in platforms"
              :key="platform.id"
              :label="platform.name"
              :value="platform.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType==='pass'" label="关联活动" prop="pid">
          <el-select
            v-model="projectDraft.project.pid"
            filterable
            remote
            placeholder="请选择"
            :remote-method="getProjects"
            :loading="pidLoading"
          >
            <el-option label="请选择" :value="0" />
            <el-option
              v-for="pItem in projects"
              :key="pItem.id"
              :label="pItem.title"
              :value="pItem.id"
            />
          </el-select>
          <span class="el-upload__tip">仅出现在关联活动的案例中，不会出现在全局项目列表中</span>
        </el-form-item>
        <el-form-item v-if="dialogType==='refuse'" label="拒绝原因" prop="review_remarks" :rules="[{ required: true, message: '不能为空'},]">
          <el-input
            v-model="projectDraft.review_remarks"
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
import { getDrafts, reviewProject, publishPreview, getProjects } from '@/api/project'
import { getPlatforms } from '@/api/platform'
import { getEnums } from '@/api/common'
import enums from '@/utils/enums'
import Pagination from '@/components/Pagination'
import { deepClone } from '@/utils'

export default {
  name: 'ProjectReview',
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
      projectDraft: {
        platform_id: [],
        project: {
          pid: 0
        }
      },
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
      previewHeight: 0,
      projects: [],
      pidLoading: false
    }
  },
  created() {
    this.getStatus().then(ret => {
      this.getDrafts()
      this.getPlatforms()
    })
  },
  methods: {
    async getStatus() {
      const res = await getEnums('status', 'all')
      this.commonStatus = res.data
    },
    async getDrafts() {
      this.listLoading = true
      let res
      if (this.status === 'submit') {
        res = await getDrafts({ status: this.commonStatus.SUBMIT.k, page: this.listQuery.page })
      } else {
        res = await getDrafts({ status: this.commonStatus.REFUSE.k, page: this.listQuery.page })
      }
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
      this.projectDraft = deepClone(scope.row)
      this.dialogVisible = true
      this.projects = []
      this.$nextTick(function() {
        this.$refs.reviewForm.clearValidate()
      })
    },
    handleRefuse(scope) {
      this.dialogVisible = true
      this.dialogType = 'refuse'
      this.projectDraft = deepClone(scope.row)
      this.$set(this.projectDraft, 'review_remarks', '')
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
    async getProjects(query) {
      this.projects = []
      if (query !== '') {
        this.pidLoading = true
        const res = await getProjects({
          title: query,
          publish: 1,
          simple: 1,
          type: enums.project.type.ACTIVITY
        })
        res.data.forEach(element => {
          if (element.id !== this.projectDraft.project_id) {
            this.projects.push(element)
          }
        })
        this.pidLoading = false
      }
    },
    async doReview() {
      if (this.dialogType === 'pass') {
        await reviewProject(this.projectDraft.id, {
          status: this.commonStatus.PASS.k,
          platform_id: this.projectDraft.platform_id,
          pid: this.projectDraft.project.pid
        })
      } else {
        await reviewProject(this.projectDraft.id, { status: this.commonStatus.REFUSE.k, review_remarks: this.projectDraft.review_remarks })
      }
      for (let index = 0; index < this.list.length; index++) {
        if (this.list[index].id === this.projectDraft.id) {
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
